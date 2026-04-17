import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Job } from '../jobs/entities/job.entity.js';
import { Application } from '../applications/entities/application.entity.js';
import { SourcesModule } from '../sources/sources.module.js';
import { CandidateProfileModule } from '../candidate-profile/candidate-profile.module.js';
import { JobIngestionController } from './job-ingestion.controller.js';
import { JobIngestionService } from './services/job-ingestion.service.js';
import { JobsDedupeService } from './services/jobs-dedupe.service.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Job, Application]),
    SourcesModule,
    CandidateProfileModule,
  ],
  controllers: [JobIngestionController],
  providers: [JobIngestionService, JobsDedupeService],
})
export class JobIngestionModule {}
