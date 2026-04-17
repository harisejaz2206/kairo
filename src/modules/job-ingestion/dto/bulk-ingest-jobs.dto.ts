import { IsArray, ValidateNested, ArrayMinSize, ArrayMaxSize } from 'class-validator';
import { Type } from 'class-transformer';
import { IngestJobDto } from './ingest-job.dto.js';

export class BulkIngestJobsDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(100) // Protect against oversized payloads from n8n workflows
  @ValidateNested({ each: true })
  @Type(() => IngestJobDto)
  jobs: IngestJobDto[];
}
