import { Controller, Get, Patch, Body } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CandidateProfileService } from './candidate-profile.service.js';
import { UpdateCandidateProfileDto } from './dto/update-candidate-profile.dto.js';

@ApiTags('Candidate Profile')
@Controller('candidate-profile')
export class CandidateProfileController {
  constructor(private readonly profileService: CandidateProfileService) {}

  // GET /api/candidate-profile
  @Get()
  @ApiOperation({ summary: 'Get the active candidate profile' })
  @ApiOkResponse({ description: 'Candidate profile returned successfully.' })
  getProfile() {
    return this.profileService.getProfile();
  }

  // PATCH /api/candidate-profile
  @Patch()
  @ApiOperation({ summary: 'Update the active candidate profile' })
  @ApiBody({ type: UpdateCandidateProfileDto })
  @ApiOkResponse({ description: 'Candidate profile updated successfully.' })
  update(@Body() dto: UpdateCandidateProfileDto) {
    return this.profileService.update(dto);
  }
}
