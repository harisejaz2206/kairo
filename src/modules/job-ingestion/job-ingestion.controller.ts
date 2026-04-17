import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JobIngestionService } from './services/job-ingestion.service.js';
import { IngestJobDto } from './dto/ingest-job.dto.js';
import { BulkIngestJobsDto } from './dto/bulk-ingest-jobs.dto.js';

@ApiTags('Job Ingestion')
@Controller('job-ingestion')
export class JobIngestionController {
  constructor(private readonly ingestionService: JobIngestionService) {}

  // POST /api/job-ingestion/single
  @Post('single')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Ingest a single normalized job payload' })
  @ApiBody({ type: IngestJobDto })
  @ApiOkResponse({ description: 'Single job ingestion completed.' })
  ingestSingle(@Body() dto: IngestJobDto) {
    return this.ingestionService.ingestOne(dto);
  }

  // POST /api/job-ingestion/bulk — primary endpoint for n8n workflows
  @Post('bulk')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Ingest a batch of normalized jobs' })
  @ApiBody({ type: BulkIngestJobsDto })
  @ApiOkResponse({ description: 'Bulk ingestion completed.' })
  ingestBulk(@Body() dto: BulkIngestJobsDto) {
    return this.ingestionService.ingestBulk(dto.jobs);
  }
}
