import { Controller, Post } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JobScoringService } from '../../job-scoring/services/job-scoring.service.js';

@ApiTags('Admin')
@Controller('admin/jobs')
export class AdminJobsController {
  constructor(private readonly jobScoringService: JobScoringService) {}

  // POST /api/admin/jobs/backfill-score
  @Post('backfill-score')
  @ApiOperation({ summary: 'Backfill scores for all currently unscored jobs' })
  @ApiOkResponse({ description: 'Backfill scoring completed.' })
  backfillScore() {
    return this.jobScoringService.backfillUnscoredJobs();
  }
}
