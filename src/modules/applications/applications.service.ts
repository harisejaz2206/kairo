import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Application } from './entities/application.entity.js';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto.js';
import { ListApplicationsDto } from './dto/list-applications.dto.js';
import { ApplicationStatus } from '../../common/enums/application-status.enum.js';

// Valid forward transitions — prevents arbitrary status jumps
const ALLOWED_TRANSITIONS: Partial<Record<ApplicationStatus, ApplicationStatus[]>> = {
  [ApplicationStatus.NEW]: [ApplicationStatus.SHORTLISTED, ApplicationStatus.ARCHIVED],
  [ApplicationStatus.SHORTLISTED]: [
    ApplicationStatus.DRAFT_GENERATED,
    ApplicationStatus.REVIEWED,
    ApplicationStatus.ARCHIVED,
  ],
  [ApplicationStatus.DRAFT_GENERATED]: [
    ApplicationStatus.REVIEWED,
    ApplicationStatus.ARCHIVED,
  ],
  [ApplicationStatus.REVIEWED]: [
    ApplicationStatus.APPLIED,
    ApplicationStatus.ARCHIVED,
  ],
  [ApplicationStatus.APPLIED]: [
    ApplicationStatus.INTERVIEW,
    ApplicationStatus.REJECTED,
  ],
  [ApplicationStatus.INTERVIEW]: [
    ApplicationStatus.OFFER,
    ApplicationStatus.REJECTED,
  ],
  [ApplicationStatus.OFFER]: [ApplicationStatus.REJECTED],
  [ApplicationStatus.REJECTED]: [ApplicationStatus.ARCHIVED],
  [ApplicationStatus.ARCHIVED]: [],
};

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectRepository(Application)
    private readonly applicationsRepository: Repository<Application>,
  ) {}

  async findAll(dto: ListApplicationsDto): Promise<{
    data: Application[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  }> {
    const { page = 1, limit = 25 } = dto;

    const qb = this.applicationsRepository
      .createQueryBuilder('application')
      .leftJoinAndSelect('application.job', 'job')
      .leftJoinAndSelect('job.source', 'source')
      .orderBy('application.last_status_changed_at', 'DESC');

    if (dto.status) {
      qb.andWhere('application.status = :status', { status: dto.status });
    }

    if (dto.priority) {
      qb.andWhere('application.priority = :priority', { priority: dto.priority });
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

  async findOne(id: string): Promise<Application> {
    const application = await this.applicationsRepository.findOne({
      where: { id },
      relations: ['job', 'job.source'],
    });

    if (!application) {
      throw new NotFoundException(`Application ${id} not found`);
    }

    return application;
  }

  async update(id: string, dto: UpdateApplicationStatusDto): Promise<Application> {
    const application = await this.findOne(id);
    const now = new Date();

    if (dto.status && dto.status !== application.status) {
      this.assertValidTransition(application.status, dto.status);

      application.status = dto.status;
      application.lastStatusChangedAt = now;

      // Stamp appliedAt exactly once when status first becomes APPLIED
      if (dto.status === ApplicationStatus.APPLIED && !application.appliedAt) {
        application.appliedAt = now;
      }
    }

    if (dto.priority !== undefined) application.priority = dto.priority;
    if (dto.fitLabel !== undefined) application.fitLabel = dto.fitLabel;
    if (dto.manualNotes !== undefined) application.manualNotes = dto.manualNotes;
    if (dto.rejectionReason !== undefined) application.rejectionReason = dto.rejectionReason;

    return this.applicationsRepository.save(application);
  }

  private assertValidTransition(from: ApplicationStatus, to: ApplicationStatus): void {
    const allowed = ALLOWED_TRANSITIONS[from] ?? [];
    if (!allowed.includes(to)) {
      throw new BadRequestException(
        `Cannot transition application from '${from}' to '${to}'. ` +
        `Allowed: [${allowed.join(', ')}]`,
      );
    }
  }
}
