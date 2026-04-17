import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Job } from './entities/job.entity.js';
import { JobsController } from './controllers/jobs.controller.js';
import { JobsService } from './services/jobs.service.js';
import { JobsQueryService } from './services/jobs-query.service.js';
import { JobScoringModule } from '../job-scoring/job-scoring.module.js';

@Module({
  imports: [TypeOrmModule.forFeature([Job]), JobScoringModule],
  controllers: [JobsController],
  providers: [JobsService, JobsQueryService],
  exports: [JobsService],
})
export class JobsModule {}
