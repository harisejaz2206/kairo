import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job } from '../../jobs/entities/job.entity.js';
import { Application } from '../../applications/entities/application.entity.js';
import { SourcesService } from '../../sources/sources.service.js';
import { CandidateProfileService } from '../../candidate-profile/candidate-profile.service.js';
import { JobsDedupeService } from './jobs-dedupe.service.js';
import { IngestJobDto } from '../dto/ingest-job.dto.js';
import { WorkplaceType } from '../../../common/enums/workplace-type.enum.js';
import { EmploymentType } from '../../../common/enums/employment-type.enum.js';
import { SeniorityHint } from '../../../common/enums/seniority-hint.enum.js';
import { ApplicationStatus } from '../../../common/enums/application-status.enum.js';
import { JobScoringService } from '../../job-scoring/services/job-scoring.service.js';

export interface IngestResult {
  status: 'created' | 'updated' | 'skipped';
  jobId: string;
}

export interface BulkIngestResult {
  total: number;
  created: number;
  updated: number;
  skipped: number;
  results: IngestResult[];
}

@Injectable()
export class JobIngestionService {
  private readonly logger = new Logger(JobIngestionService.name);

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(Job)
    private readonly jobsRepository: Repository<Job>,
    @InjectRepository(Application)
    private readonly applicationsRepository: Repository<Application>,
    private readonly sourcesService: SourcesService,
    private readonly profileService: CandidateProfileService,
    private readonly dedupeService: JobsDedupeService,
    private readonly jobScoringService: JobScoringService,
  ) {}

  async ingestOne(dto: IngestJobDto): Promise<IngestResult> {
    const source = await this.sourcesService.findBySlug(dto.sourceSlug);
    const profile = await this.profileService.getProfile();
    const now = new Date();
    const profileId = profile.id;
    const shouldScoreOnIngest =
      this.configService.get<boolean>('featureFlags.enableScoreOnIngest') ?? true;

    const { existing, isNew } = await this.dedupeService.findExisting(dto, source.id);
    const canonicalFields = this.buildCanonicalJobFields(dto, source.id);

    if (!isNew && existing) {
      Object.assign(existing, canonicalFields, {
        fetchedAt: now,
        lastSeenAt: now,
      });

      const savedJob = await this.jobsRepository.save(existing);

      await this.ensureApplicationRecord(savedJob.id, profileId, now);

      if (shouldScoreOnIngest) {
        await this.jobScoringService.scoreJob(savedJob, profile);
      }

      this.logger.log(`Refreshed existing job: ${dto.companyName} — ${dto.title} [${savedJob.id}]`);

      return { status: 'updated', jobId: savedJob.id };
    }

    const job = this.jobsRepository.create({
      ...canonicalFields,
      fetchedAt: now,
      firstSeenAt: now,
      lastSeenAt: now,
      isActive: true,
    });

    const savedJob = await this.jobsRepository.save(job);

    // Create the application record immediately so the job enters the pipeline
    await this.ensureApplicationRecord(savedJob.id, profileId, now);

    if (shouldScoreOnIngest) {
      await this.jobScoringService.scoreJob(savedJob, profile);
    }

    this.logger.log(`Ingested new job: ${dto.companyName} — ${dto.title} [${savedJob.id}]`);

    return { status: 'created', jobId: savedJob.id };
  }

  async ingestBulk(jobs: IngestJobDto[]): Promise<BulkIngestResult> {
    this.logger.log(`Bulk ingestion started: ${jobs.length} jobs`);

    const results: IngestResult[] = [];
    let created = 0, updated = 0, skipped = 0;

    for (const dto of jobs) {
      try {
        const result = await this.ingestOne(dto);
        results.push(result);
        if (result.status === 'created') created++;
        else if (result.status === 'updated') updated++;
        else skipped++;
      } catch (err) {
        this.logger.error(`Failed to ingest job "${dto.title}" from ${dto.sourceSlug}: ${err}`);
        results.push({ status: 'skipped', jobId: '' });
        skipped++;
      }
    }

    this.logger.log(`Bulk ingestion done — created: ${created}, updated: ${updated}, skipped: ${skipped}`);

    return { total: jobs.length, created, updated, skipped, results };
  }

  // Creates an application record with status NEW if one doesn't already exist
  private async ensureApplicationRecord(
    jobId: string,
    candidateProfileId: string,
    now: Date,
  ): Promise<void> {
    const exists = await this.applicationsRepository.existsBy({
      jobId,
      candidateProfileId,
    });

    if (!exists) {
      const application = this.applicationsRepository.create({
        jobId,
        candidateProfileId,
        status: ApplicationStatus.NEW,
        lastStatusChangedAt: now,
      });
      await this.applicationsRepository.save(application);
    }
  }

  private buildCanonicalJobFields(
    dto: IngestJobDto,
    sourceId: string,
  ): Partial<Job> {
    const dedupeKey = this.dedupeService.buildDedupeKey(
      dto.companyName,
      dto.title,
      dto.countryNormalized ?? dto.locationRaw ?? '',
    );

    const contentHash = this.dedupeService.buildContentHash(
      dto.companyName,
      dto.title,
      dto.locationRaw ?? dto.countryNormalized ?? '',
      dto.descriptionText,
    );

    return {
      sourceId,
      externalJobId: dto.externalJobId ?? null,
      externalCompanyId: null,
      sourceJobUrl: dto.sourceJobUrl,
      companyName: dto.companyName,
      title: dto.title,
      locationRaw: dto.locationRaw ?? null,
      cityNormalized: dto.cityNormalized ?? null,
      countryNormalized: dto.countryNormalized ?? null,
      workplaceType: dto.workplaceType ?? WorkplaceType.UNKNOWN,
      employmentType: dto.employmentType ?? EmploymentType.UNKNOWN,
      seniorityHint: dto.seniorityHint ?? SeniorityHint.UNKNOWN,
      languageRequirements: dto.languageRequirements ?? null,
      relocationSupported: dto.relocationSupported ?? null,
      visaSponsorshipSignal: dto.visaSponsorshipSignal ?? null,
      descriptionText: dto.descriptionText,
      requirementsText: dto.requirementsText ?? null,
      techKeywords: dto.techKeywords ?? null,
      postedAt: dto.postedAt ? new Date(dto.postedAt) : null,
      sourcePayloadJson: dto.sourcePayloadJson ?? {},
      contentHash,
      dedupeKey,
      isActive: true,
    };
  }
}
