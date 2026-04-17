import { Controller, Get, Patch, Body } from '@nestjs/common';
import { CandidateProfileService } from './candidate-profile.service.js';
import { UpdateCandidateProfileDto } from './dto/update-candidate-profile.dto.js';

@Controller('candidate-profile')
export class CandidateProfileController {
  constructor(private readonly profileService: CandidateProfileService) {}

  // GET /api/candidate-profile
  @Get()
  getProfile() {
    return this.profileService.getProfile();
  }

  // PATCH /api/candidate-profile
  @Patch()
  update(@Body() dto: UpdateCandidateProfileDto) {
    return this.profileService.update(dto);
  }
}
