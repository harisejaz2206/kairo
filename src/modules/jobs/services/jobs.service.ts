import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job } from '../entities/job.entity.js';
import { JobScore } from '../../job-scoring/entities/job-score.entity.js';
import { JobScoringService } from '../../job-scoring/services/job-scoring.service.js';

@Injectable()
export class JobsService {
  constructor(
    @InjectRepository(Job)
    private readonly jobsRepository: Repository<Job>,
    private readonly jobScoringService: JobScoringService,
  ) {}

  async findOne(id: string): Promise<Job> {
    const job = await this.jobsRepository.findOne({
      where: { id },
      relations: ['source', 'scores', 'application'],
    });

    if (!job) {
      throw new NotFoundException(`Job ${id} not found`);
    }

    return job;
  }

  async archive(id: string): Promise<Job> {
    const job = await this.findOne(id);
    job.isActive = false;
    return this.jobsRepository.save(job);
  }

  async rescore(id: string): Promise<JobScore> {
    await this.findOne(id);
    return this.jobScoringService.scoreJobById(id);
  }
}
