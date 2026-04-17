import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';

import appConfig from './config/app.config.js';
import databaseConfig from './config/database.config.js';
import featureFlagsConfig from './config/feature-flags.config.js';
import openaiConfig from './config/openai.config.js';
import { DatabaseModule } from './database/database.module.js';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter.js';
import { ResponseInterceptor } from './common/interceptors/response.interceptor.js';

import { SourcesModule } from './modules/sources/sources.module.js';
import { CandidateProfileModule } from './modules/candidate-profile/candidate-profile.module.js';
import { JobsModule } from './modules/jobs/jobs.module.js';
import { JobIngestionModule } from './modules/job-ingestion/job-ingestion.module.js';
import { ApplicationsModule } from './modules/applications/applications.module.js';
import { JobScoringModule } from './modules/job-scoring/job-scoring.module.js';
import { DraftsModule } from './modules/drafts/drafts.module.js';
import { AdminModule } from './modules/admin/admin.module.js';
import { UsersModule } from './modules/users/users.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [appConfig, databaseConfig, featureFlagsConfig, openaiConfig],
      cache: true,
    }),

    DatabaseModule,

    // Phase 1 domain modules
    SourcesModule,
    CandidateProfileModule,
    JobsModule,
    JobIngestionModule,
    ApplicationsModule,

    // Phase 2+ — entities registered now, logic added later
    JobScoringModule,
    DraftsModule,
    AdminModule,

    // Baseline scaffold — kept for future auth
    UsersModule,
  ],
  providers: [
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
  ],
})
export class AppModule {}
