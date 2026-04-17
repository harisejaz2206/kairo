import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DraftAsset } from './entities/draft-asset.entity.js';
import { Application } from '../applications/entities/application.entity.js';
import { JobScore } from '../job-scoring/entities/job-score.entity.js';
import { CandidateProfileModule } from '../candidate-profile/candidate-profile.module.js';
import { OpenAiModule } from '../../integrations/openai/openai.module.js';
import { DraftGenerationService } from './services/draft-generation.service.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([DraftAsset, Application, JobScore]),
    CandidateProfileModule,
    OpenAiModule,
  ],
  providers: [DraftGenerationService],
  exports: [DraftGenerationService],
})
export class DraftsModule {}
