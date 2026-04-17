import { IsArray, ValidateNested, ArrayMinSize, ArrayMaxSize } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IngestJobDto } from './ingest-job.dto.js';

export class BulkIngestJobsDto {
  @ApiProperty({
    description: 'Batch of normalized jobs to ingest from an external workflow such as n8n.',
    type: [IngestJobDto],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(100) // Protect against oversized payloads from n8n workflows
  @ValidateNested({ each: true })
  @Type(() => IngestJobDto)
  jobs: IngestJobDto[];
}
