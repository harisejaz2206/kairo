import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CandidateProfile } from './entities/candidate-profile.entity.js';
import { UpdateCandidateProfileDto } from './dto/update-candidate-profile.dto.js';

@Injectable()
export class CandidateProfileService {
  constructor(
    @InjectRepository(CandidateProfile)
    private readonly profileRepository: Repository<CandidateProfile>,
  ) {}

  // Single-user system — returns the first (and only) profile
  async getProfile(): Promise<CandidateProfile> {
    const profile = await this.profileRepository.findOne({
      where: {},
      order: { createdAt: 'ASC' },
    });

    if (!profile) {
      throw new NotFoundException(
        'No candidate profile found. Run the seed script to create one.',
      );
    }

    return profile;
  }

  async update(dto: UpdateCandidateProfileDto): Promise<CandidateProfile> {
    const profile = await this.getProfile();
    Object.assign(profile, dto);
    return this.profileRepository.save(profile);
  }

  // Used by seed script and ingestion services to resolve the active profile ID
  async getProfileId(): Promise<string> {
    const profile = await this.getProfile();
    return profile.id;
  }
}
