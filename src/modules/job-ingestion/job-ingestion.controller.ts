import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JobIngestionService } from './services/job-ingestion.service.js';
import { IngestJobDto } from './dto/ingest-job.dto.js';
import { BulkIngestJobsDto } from './dto/bulk-ingest-jobs.dto.js';

@Controller('job-ingestion')
export class JobIngestionController {
  constructor(private readonly ingestionService: JobIngestionService) {}

  // POST /api/job-ingestion/single
  @Post('single')
  @HttpCode(HttpStatus.OK)
  ingestSingle(@Body() dto: IngestJobDto) {
    return this.ingestionService.ingestOne(dto);
  }

  // POST /api/job-ingestion/bulk — primary endpoint for n8n workflows
  @Post('bulk')
  @HttpCode(HttpStatus.OK)
  ingestBulk(@Body() dto: BulkIngestJobsDto) {
    return this.ingestionService.ingestBulk(dto.jobs);
  }
}
