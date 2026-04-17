import {
  IsEnum,
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUrl,
  IsObject,
  MaxLength,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SourceType } from '../../../common/enums/source-type.enum.js';

export class CreateSourceDto {
  @ApiProperty({
    description: 'Human-friendly source name.',
    example: 'Greenhouse Board',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  // Lowercase, hyphen-separated — used in API paths and n8n payloads
  @ApiProperty({
    description: 'Stable slug used in ingestion payloads and internal routing.',
    example: 'greenhouse-board',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @Matches(/^[a-z0-9-]+$/, {
    message: 'slug must be lowercase letters, numbers, and hyphens only',
  })
  slug: string;

  @ApiProperty({
    description: 'Source type used for integrations and operational behavior.',
    enum: SourceType,
    example: SourceType.GREENHOUSE,
  })
  @IsEnum(SourceType)
  type: SourceType;

  @ApiPropertyOptional({
    description: 'Base URL for the source when applicable.',
    example: 'https://boards.greenhouse.io',
  })
  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  baseUrl?: string;

  @ApiPropertyOptional({
    description: 'Source-specific configuration stored as JSON.',
    example: { boardToken: 'acme' },
    type: 'object',
    additionalProperties: true,
  })
  @IsOptional()
  @IsObject()
  configJson?: Record<string, unknown>;
}
