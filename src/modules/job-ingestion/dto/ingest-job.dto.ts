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
import { WorkplaceType } from '../../../common/enums/workplace-type.enum.js';
import { EmploymentType } from '../../../common/enums/employment-type.enum.js';
import { SeniorityHint } from '../../../common/enums/seniority-hint.enum.js';

export class IngestJobDto {
  // Must match an existing source slug — used to look up the source record
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  sourceSlug: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  externalJobId?: string;

  @IsUrl()
  sourceJobUrl: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  companyName: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  locationRaw?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  cityNormalized?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  countryNormalized?: string;

  @IsOptional()
  @IsEnum(WorkplaceType)
  workplaceType?: WorkplaceType;

  @IsOptional()
  @IsEnum(EmploymentType)
  employmentType?: EmploymentType;

  @IsOptional()
  @IsEnum(SeniorityHint)
  seniorityHint?: SeniorityHint;

  @IsString()
  @IsNotEmpty()
  descriptionText: string;

  @IsOptional()
  @IsString()
  requirementsText?: string;

  @IsOptional()
  @IsDateString()
  postedAt?: string;

  @IsOptional()
  @IsArray()
  @IsObject({ each: true })
  languageRequirements?: Record<string, unknown>[];

  @IsOptional()
  @IsBoolean()
  relocationSupported?: boolean;

  @IsOptional()
  @IsBoolean()
  visaSponsorshipSignal?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  techKeywords?: string[];

  @IsOptional()
  @IsObject()
  sourcePayloadJson?: Record<string, unknown>;
}
