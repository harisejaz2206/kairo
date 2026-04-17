import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobScore } from './entities/job-score.entity.js';

// Scoring logic lives in Phase 2+. Module exists now so the entity
// is registered and available for relations in other modules.
@Module({
  imports: [TypeOrmModule.forFeature([JobScore])],
  exports: [TypeOrmModule],
})
export class JobScoringModule {}
