import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobScore } from './entities/job-score.entity.js';
import { Job } from '../jobs/entities/job.entity.js';
import { CandidateProfileModule } from '../candidate-profile/candidate-profile.module.js';
import { RuleBasedScoringService } from './services/rule-based-scoring.service.js';
import { JobScoringService } from './services/job-scoring.service.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([JobScore, Job]),
    CandidateProfileModule,
  ],
  providers: [RuleBasedScoringService, JobScoringService],
  exports: [JobScoringService],
})
export class JobScoringModule {}
