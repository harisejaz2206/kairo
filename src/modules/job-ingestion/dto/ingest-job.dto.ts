import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsArray,
  IsObject,
  IsDateString,
  IsUrl,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { WorkplaceType } from '../../../common/enums/workplace-type.enum.js';
import { EmploymentType } from '../../../common/enums/employment-type.enum.js';
import { SeniorityHint } from '../../../common/enums/seniority-hint.enum.js';

export class IngestJobDto {
  // Must match an existing source slug — used to look up the source record
  @ApiProperty({
    description: 'Slug of an existing job source registered in the system.',
    example: 'greenhouse-board',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  sourceSlug: string;

  @ApiPropertyOptional({
    description: 'Provider-specific job identifier used as a strong dedupe signal.',
    example: 'gh-12345',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  externalJobId?: string;

  @ApiProperty({
    description: 'Canonical public URL for the job listing.',
    example: 'https://boards.greenhouse.io/acme/jobs/12345',
  })
  @IsUrl()
  sourceJobUrl: string;

  @ApiProperty({
    description: 'Company name shown on the listing.',
    example: 'Acme',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  companyName: string;

  @ApiProperty({
    description: 'Job title as received from the source.',
    example: 'Backend Engineer',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @ApiPropertyOptional({
    description: 'Original raw location string from the source.',
    example: 'Berlin, Germany',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  locationRaw?: string;

  @ApiPropertyOptional({
    description: 'Normalized city value if available.',
    example: 'Berlin',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  cityNormalized?: string;

  @ApiPropertyOptional({
    description: 'Normalized country value if available.',
    example: 'Germany',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  countryNormalized?: string;

  @ApiPropertyOptional({
    description: 'Normalized workplace mode for filtering and scoring.',
    enum: WorkplaceType,
    example: WorkplaceType.REMOTE,
  })
  @IsOptional()
  @IsEnum(WorkplaceType)
  workplaceType?: WorkplaceType;

  @ApiPropertyOptional({
    description: 'Normalized employment type for the role.',
    enum: EmploymentType,
    example: EmploymentType.FULL_TIME,
  })
  @IsOptional()
  @IsEnum(EmploymentType)
  employmentType?: EmploymentType;

  @ApiPropertyOptional({
    description: 'Best-effort normalized seniority hint.',
    enum: SeniorityHint,
    example: SeniorityHint.MID,
  })
  @IsOptional()
  @IsEnum(SeniorityHint)
  seniorityHint?: SeniorityHint;

  @ApiProperty({
    description: 'Normalized job description text used for scoring and later draft generation.',
    example: 'Build APIs with Node.js, TypeScript, and PostgreSQL...',
  })
  @IsString()
  @IsNotEmpty()
  descriptionText: string;

  @ApiPropertyOptional({
    description: 'Separate requirements section when available.',
    example: '3+ years of backend engineering experience with TypeScript.',
  })
  @IsOptional()
  @IsString()
  requirementsText?: string;

  @ApiPropertyOptional({
    description: 'Job posting date in ISO 8601 format.',
    example: '2026-04-18T09:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  postedAt?: string;

  @ApiPropertyOptional({
    description: 'Structured language requirements extracted from the listing.',
    example: [{ language: 'German', level: 'preferred' }],
    type: 'array',
    items: { type: 'object', additionalProperties: true },
  })
  @IsOptional()
  @IsArray()
  @IsObject({ each: true })
  languageRequirements?: Record<string, unknown>[];

  @ApiPropertyOptional({
    description: 'Whether the employer signals relocation support.',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  relocationSupported?: boolean;

  @ApiPropertyOptional({
    description: 'Whether the listing explicitly signals visa sponsorship.',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  visaSponsorshipSignal?: boolean;

  @ApiPropertyOptional({
    description: 'Extracted technology keywords used in deterministic and AI-assisted scoring.',
    example: ['Node.js', 'TypeScript', 'NestJS', 'PostgreSQL'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  techKeywords?: string[];

  @ApiPropertyOptional({
    description: 'Original source payload preserved for debugging and reprocessing.',
    example: { department: 'Engineering', board: 'Greenhouse' },
    type: 'object',
    additionalProperties: true,
  })
  @IsOptional()
  @IsObject()
  sourcePayloadJson?: Record<string, unknown>;
}
