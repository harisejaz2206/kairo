import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job } from '../entities/job.entity.js';

@Injectable()
export class JobsService {
  constructor(
    @InjectRepository(Job)
    private readonly jobsRepository: Repository<Job>,
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
}
