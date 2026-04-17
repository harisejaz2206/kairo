import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createHash } from 'crypto';
import { Job } from '../../jobs/entities/job.entity.js';
import { IngestJobDto } from '../dto/ingest-job.dto.js';

export interface DedupeResult {
  existing: Job | null;
  isNew: boolean;
}

@Injectable()
export class JobsDedupeService {
  constructor(
    @InjectRepository(Job)
    private readonly jobsRepository: Repository<Job>,
  ) {}

  /**
   * Dedupe strategy (checked in order):
   *   1. sourceId + externalJobId
   *   2. exact sourceJobUrl
   *   3. dedupeKey (normalized company::title::country)
   *   4. contentHash (hash of company + title + location + description)
   */
  async findExisting(dto: IngestJobDto, sourceId: string): Promise<DedupeResult> {
    // 1. Source + external ID — strongest signal
    if (dto.externalJobId) {
      const byExternalId = await this.jobsRepository
        .createQueryBuilder('job')
        .where('job.source_id = :sourceId', { sourceId })
        .andWhere('job.external_job_id = :externalJobId', {
          externalJobId: dto.externalJobId,
        })
        .getOne();

      if (byExternalId) return { existing: byExternalId, isNew: false };
    }

    // 2. Exact URL match
    const byUrl = await this.jobsRepository.findOneBy({
      sourceJobUrl: dto.sourceJobUrl,
    });
    if (byUrl) return { existing: byUrl, isNew: false };

    // 3. Dedupe key
    const dedupeKey = this.buildDedupeKey(
      dto.companyName,
      dto.title,
      dto.countryNormalized ?? dto.locationRaw ?? '',
    );
    const byDedupeKey = await this.jobsRepository.findOneBy({ dedupeKey });
    if (byDedupeKey) return { existing: byDedupeKey, isNew: false };

    // 4. Content hash
    const contentHash = this.buildContentHash(
      dto.companyName,
      dto.title,
      dto.locationRaw ?? dto.countryNormalized ?? '',
      dto.descriptionText,
    );
    const byHash = await this.jobsRepository.findOneBy({ contentHash });
    if (byHash) return { existing: byHash, isNew: false };

    return { existing: null, isNew: true };
  }

  buildDedupeKey(company: string, title: string, location: string): string {
    return [company, title, location]
      .map((s) => this.normalize(s))
      .join('::');
  }

  buildContentHash(
    company: string,
    title: string,
    location: string,
    description: string,
  ): string {
    const raw = [company, title, location, description.trim()]
      .map((s) => this.normalize(s))
      .join('|');

    return createHash('sha256').update(raw).digest('hex');
  }

  private normalize(value: string): string {
    return value.toLowerCase().replace(/\s+/g, ' ').trim();
  }
}
