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
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCandidateProfileDto {
  @ApiPropertyOptional({
    description: 'Display name for the active candidate profile.',
    example: 'Haris Ejaz',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  displayName?: string;

  @ApiPropertyOptional({
    description: 'Target job titles used in scoring.',
    example: ['Backend Engineer', 'Software Engineer', 'Node.js Engineer'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  targetTitles?: string[];

  @ApiPropertyOptional({
    description: 'Preferred target countries.',
    example: ['Germany', 'Netherlands'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  targetCountries?: string[];

  @ApiPropertyOptional({
    description: 'Preferred target cities or regions.',
    example: ['Berlin', 'Amsterdam'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  targetLocations?: string[];

  @ApiPropertyOptional({
    description: 'Keywords that increase scoring confidence when matched.',
    example: ['Node.js', 'TypeScript', 'NestJS', 'PostgreSQL'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  preferredKeywords?: string[];

  @ApiPropertyOptional({
    description: 'Keywords that reduce or disqualify fit.',
    example: ['principal', 'staff', 'ruby'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  excludedKeywords?: string[];

  @ApiPropertyOptional({
    description: 'Hard requirements that strongly influence fit.',
    example: ['Remote-friendly', 'Visa sponsorship'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  mustHaveRules?: string[];

  @ApiPropertyOptional({
    description: 'Nice-to-have preferences used for nuance.',
    example: ['Fintech domain', 'Small engineering team'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  niceToHaveRules?: string[];

  @ApiPropertyOptional({
    description: 'Remote and workplace preferences.',
    example: { preferred: ['remote', 'hybrid'], acceptable: ['onsite'] },
    type: 'object',
    additionalProperties: true,
  })
  @IsOptional()
  @IsObject()
  remotePreferences?: Record<string, unknown>;

  @ApiPropertyOptional({
    description: 'Visa and sponsorship requirements.',
    example: { requiresSponsorship: true },
    type: 'object',
    additionalProperties: true,
  })
  @IsOptional()
  @IsObject()
  visaPreferences?: Record<string, unknown>;

  @ApiPropertyOptional({
    description: 'Years of professional experience.',
    example: 4,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(50)
  experienceYears?: number;

  @ApiPropertyOptional({
    description: 'Free-text summary of the candidate stack and strengths.',
    example: 'Backend-focused engineer working with Node.js, TypeScript, NestJS, and PostgreSQL.',
  })
  @IsOptional()
  @IsString()
  stackSummary?: string;

  @ApiPropertyOptional({
    description: 'Master resume text used for AI scoring and draft generation.',
    example: 'Experienced backend engineer with a focus on scalable APIs...',
  })
  @IsOptional()
  @IsString()
  masterResumeText?: string;
}
