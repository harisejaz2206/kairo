import {
  IsString,
  IsOptional,
  IsArray,
  IsNumber,
  IsObject,
  MaxLength,
  Min,
  Max,
} from 'class-validator';

export class UpdateCandidateProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  displayName?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  targetTitles?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  targetCountries?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  targetLocations?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  preferredKeywords?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  excludedKeywords?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  mustHaveRules?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  niceToHaveRules?: string[];

  @IsOptional()
  @IsObject()
  remotePreferences?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  visaPreferences?: Record<string, unknown>;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(50)
  experienceYears?: number;

  @IsOptional()
  @IsString()
  stackSummary?: string;

  @IsOptional()
  @IsString()
  masterResumeText?: string;
}
