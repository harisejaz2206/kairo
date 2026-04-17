import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CandidateProfile } from './entities/candidate-profile.entity.js';
import { CandidateProfileController } from './candidate-profile.controller.js';
import { CandidateProfileService } from './candidate-profile.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([CandidateProfile])],
  controllers: [CandidateProfileController],
  providers: [CandidateProfileService],
  exports: [CandidateProfileService],
})
export class CandidateProfileModule {}
