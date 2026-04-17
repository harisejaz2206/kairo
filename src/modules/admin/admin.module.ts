import { Module } from '@nestjs/common';
import { JobScoringModule } from '../job-scoring/job-scoring.module.js';
import { AdminJobsController } from './controllers/admin-jobs.controller.js';

@Module({
  imports: [JobScoringModule],
  controllers: [AdminJobsController],
})
export class AdminModule {}
