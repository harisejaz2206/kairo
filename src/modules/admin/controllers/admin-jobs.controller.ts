import { Controller, Post } from '@nestjs/common';
import { JobScoringService } from '../../job-scoring/services/job-scoring.service.js';

@Controller('admin/jobs')
export class AdminJobsController {
  constructor(private readonly jobScoringService: JobScoringService) {}

  // POST /api/admin/jobs/backfill-score
  @Post('backfill-score')
  backfillScore() {
    return this.jobScoringService.backfillUnscoredJobs();
  }
}
