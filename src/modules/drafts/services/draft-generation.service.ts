import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DraftAsset } from '../entities/draft-asset.entity.js';
import { Application } from '../../applications/entities/application.entity.js';
import { JobScore } from '../../job-scoring/entities/job-score.entity.js';
import { ApplicationStatus } from '../../../common/enums/application-status.enum.js';
import { DraftAssetType } from '../../../common/enums/draft-asset-type.enum.js';
import { CandidateProfileService } from '../../candidate-profile/candidate-profile.service.js';
import { OpenAiClientService } from '../../../integrations/openai/services/openai-client.service.js';

export interface DraftGenerationResult {
  generated: DraftAsset[];
  skipped: DraftAssetType[];
}

const DRAFT_TYPES: DraftAssetType[] = [
  DraftAssetType.TAILORED_SUMMARY,
  DraftAssetType.CV_BULLETS,
  DraftAssetType.COVER_NOTE,
  DraftAssetType.RECRUITER_MESSAGE,
];

@Injectable()
export class DraftGenerationService {
  private readonly logger = new Logger(DraftGenerationService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly candidateProfileService: CandidateProfileService,
    private readonly openAiClientService: OpenAiClientService,
    @InjectRepository(DraftAsset)
    private readonly draftAssetsRepository: Repository<DraftAsset>,
    @InjectRepository(Application)
    private readonly applicationsRepository: Repository<Application>,
    @InjectRepository(JobScore)
    private readonly jobScoresRepository: Repository<JobScore>,
  ) {}

  async listForApplication(applicationId: string): Promise<DraftAsset[]> {
    return this.draftAssetsRepository.find({
      where: { applicationId },
      order: { createdAt: 'ASC' },
    });
  }

  async generateForApplication(applicationId: string): Promise<DraftGenerationResult> {
    if (!this.openAiClientService.isConfigured()) {
      throw new BadRequestException('OpenAI is not configured for draft generation.');
    }

    const application = await this.applicationsRepository.findOne({
      where: { id: applicationId },
      relations: ['job', 'job.source'],
    });

    if (!application) {
      throw new BadRequestException(`Application ${applicationId} not found.`);
    }

    const profile = await this.candidateProfileService.getProfile();
    const latestScore = await this.jobScoresRepository.findOne({
      where: {
        jobId: application.jobId,
        candidateProfileId: application.candidateProfileId,
      },
      order: { scoredAt: 'DESC' },
    });

    if (!latestScore) {
      throw new BadRequestException(
        'Cannot generate drafts before the job has been scored.',
      );
    }

    if (!this.canGenerateDrafts(application.status, latestScore.overallScore)) {
      throw new BadRequestException(
        'Drafts can only be generated for shortlisted applications or strong matches.',
      );
    }

    const existingDrafts = await this.listForApplication(application.id);
    const existingTypes = new Set(existingDrafts.map((draft) => draft.type));

    const generated: DraftAsset[] = [];
    const skipped: DraftAssetType[] = [];

    for (const type of DRAFT_TYPES) {
      if (existingTypes.has(type)) {
        skipped.push(type);
        continue;
      }

      const content = await this.generateDraftContent(type, {
        application,
        profile,
        latestScore,
      });

      const draft = this.draftAssetsRepository.create({
        applicationId: application.id,
        type,
        content: content.text,
        metadataJson: {
          responseId: content.responseId,
          score: latestScore.overallScore,
          sourceSlug: application.job.source?.slug ?? null,
        },
        modelName: this.openAiClientService.getModel(),
        version: 'v1',
      });

      generated.push(await this.draftAssetsRepository.save(draft));
    }

    if (generated.length > 0) {
      await this.advanceApplicationForDrafts(application, latestScore.overallScore);
    }

    return { generated, skipped };
  }

  async maybeGenerateForStrongMatch(score: JobScore): Promise<void> {
    const enabled =
      this.configService.get<boolean>('featureFlags.enableAutoDraftGeneration') ?? false;
    const threshold =
      this.configService.get<number>('featureFlags.autoDraftScoreThreshold') ?? 8;

    if (!enabled || !this.openAiClientService.isConfigured()) {
      return;
    }

    if (score.overallScore < threshold) {
      return;
    }

    const application = await this.applicationsRepository.findOneBy({
      jobId: score.jobId,
      candidateProfileId: score.candidateProfileId,
    });

    if (!application) {
      return;
    }

    const existingDraftCount = await this.draftAssetsRepository.countBy({
      applicationId: application.id,
    });

    if (existingDraftCount > 0) {
      return;
    }

    try {
      await this.generateForApplication(application.id);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(
        `Auto draft generation skipped for application ${application.id}: ${message}`,
      );
    }
  }

  private canGenerateDrafts(status: ApplicationStatus, overallScore: number): boolean {
    const threshold =
      this.configService.get<number>('featureFlags.autoDraftScoreThreshold') ?? 8;

    return (
      [
        ApplicationStatus.SHORTLISTED,
        ApplicationStatus.DRAFT_GENERATED,
        ApplicationStatus.REVIEWED,
        ApplicationStatus.APPLIED,
        ApplicationStatus.INTERVIEW,
        ApplicationStatus.OFFER,
      ].includes(status) || overallScore >= threshold
    );
  }

  private async advanceApplicationForDrafts(
    application: Application,
    overallScore: number,
  ): Promise<void> {
    const threshold =
      this.configService.get<number>('featureFlags.autoDraftScoreThreshold') ?? 8;

    if (application.status === ApplicationStatus.NEW && overallScore >= threshold) {
      application.status = ApplicationStatus.SHORTLISTED;
      application.lastStatusChangedAt = new Date();
    }

    if (
      application.status === ApplicationStatus.SHORTLISTED ||
      application.status === ApplicationStatus.NEW
    ) {
      application.status = ApplicationStatus.DRAFT_GENERATED;
      application.lastStatusChangedAt = new Date();
    }

    await this.applicationsRepository.save(application);
  }

  private async generateDraftContent(
    type: DraftAssetType,
    context: {
      application: Application;
      profile: Awaited<ReturnType<CandidateProfileService['getProfile']>>;
      latestScore: JobScore;
    },
  ): Promise<{ text: string; responseId: string }> {
    const client = this.openAiClientService.createClient();
    const response = await client.responses.create({
      model: this.openAiClientService.getModel(),
      reasoning: {
        effort: this.openAiClientService.getReasoningEffort() as
          | 'none'
          | 'minimal'
          | 'low'
          | 'medium'
          | 'high',
      },
      input: [
        {
          role: 'system',
          content: [
            {
              type: 'input_text',
              text:
                'You generate concise, grounded application drafts. Use only the candidate profile and job data provided. Do not invent achievements, years of experience, sponsorship claims, or responsibilities.',
            },
          ],
        },
        {
          role: 'user',
          content: [
            {
              type: 'input_text',
              text: JSON.stringify({
                draftType: type,
                draftInstructions: this.getDraftInstructions(type),
                candidateProfile: context.profile,
                application: {
                  id: context.application.id,
                  status: context.application.status,
                },
                job: {
                  companyName: context.application.job.companyName,
                  title: context.application.job.title,
                  workplaceType: context.application.job.workplaceType,
                  locationRaw: context.application.job.locationRaw,
                  countryNormalized: context.application.job.countryNormalized,
                  descriptionText: context.application.job.descriptionText,
                  requirementsText: context.application.job.requirementsText,
                  techKeywords: context.application.job.techKeywords,
                },
                score: {
                  overallScore: context.latestScore.overallScore,
                  strengths: context.latestScore.strengthsJson,
                  redFlags: context.latestScore.redFlagsJson,
                  explanation: context.latestScore.explanationJson,
                },
              }),
            },
          ],
        },
      ],
    });

    if (!response.output_text?.trim()) {
      throw new Error(`No draft content returned for ${type}`);
    }

    return {
      text: response.output_text.trim(),
      responseId: response.id,
    };
  }

  private getDraftInstructions(type: DraftAssetType): string {
    switch (type) {
      case DraftAssetType.TAILORED_SUMMARY:
        return 'Write a concise 4-6 sentence summary of why the candidate is a strong fit for this job.';
      case DraftAssetType.CV_BULLETS:
        return 'Write 4 grounded resume bullet suggestions tailored to the job. Each bullet should be concise and realistic.';
      case DraftAssetType.COVER_NOTE:
        return 'Write a short cover note of 2-3 paragraphs. Keep it direct, professional, and specific to the role.';
      case DraftAssetType.RECRUITER_MESSAGE:
        return 'Write a short recruiter outreach message of 5-7 sentences. Keep it natural and not overly formal.';
      default:
        return 'Write a concise, grounded draft for this application.';
    }
  }
}
