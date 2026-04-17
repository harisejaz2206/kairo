import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job } from '../entities/job.entity.js';
import { ListJobsDto } from '../dto/list-jobs.dto.js';

export interface PaginatedJobs {
  data: Job[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

@Injectable()
export class JobsQueryService {
  constructor(
    @InjectRepository(Job)
    private readonly jobsRepository: Repository<Job>,
  ) {}

  async findAll(dto: ListJobsDto): Promise<PaginatedJobs> {
    const { page = 1, limit = 25, sortBy = 'createdAt', sortOrder = 'DESC' } = dto;

    const qb = this.jobsRepository
      .createQueryBuilder('job')
      .leftJoinAndSelect('job.source', 'source')
      .leftJoinAndSelect(
        'job.scores',
        'score',
        // Join only the latest score per job via a subquery
        'score.id = (SELECT s.id FROM job_scores s WHERE s.job_id = job.id ORDER BY s.scored_at DESC LIMIT 1)',
      )
      .leftJoinAndSelect(
        'job.application',
        'application',
        'application.job_id = job.id',
      )
      .where('job.is_active = true');

    if (dto.search) {
      qb.andWhere(
        '(LOWER(job.title) LIKE :search OR LOWER(job.company_name) LIKE :search)',
        { search: `%${dto.search.toLowerCase()}%` },
      );
    }

    if (dto.country) {
      qb.andWhere('LOWER(job.country_normalized) = :country', {
        country: dto.country.toLowerCase(),
      });
    }

    if (dto.workplaceType) {
      qb.andWhere('job.workplace_type = :workplaceType', {
        workplaceType: dto.workplaceType,
      });
    }

    if (dto.sourceSlug) {
      qb.andWhere('source.slug = :sourceSlug', { sourceSlug: dto.sourceSlug });
    }

    if (dto.minScore !== undefined) {
      qb.andWhere('score.overall_score >= :minScore', {
        minScore: dto.minScore,
      });
    }

    if (dto.maxScore !== undefined) {
      qb.andWhere('score.overall_score <= :maxScore', {
        maxScore: dto.maxScore,
      });
    }

    if (dto.visaSponsorshipSignal !== undefined) {
      qb.andWhere('job.visa_sponsorship_signal = :visa', {
        visa: dto.visaSponsorshipSignal,
      });
    }

    const sortColumn =
      sortBy === 'postedAt'
        ? 'job.posted_at'
        : sortBy === 'overallScore'
          ? 'score.overall_score'
          : 'job.created_at';
    qb.orderBy(sortColumn, sortOrder);
    if (sortBy === 'overallScore') {
      qb.addOrderBy('job.created_at', 'DESC');
    }

    const [data, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }
}
