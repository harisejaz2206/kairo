import { Type } from 'class-transformer';
import {
  IsOptional,
  IsString,
  IsEnum,
  IsBoolean,
  IsNumber,
  IsIn,
  Min,
  Max,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { WorkplaceType } from '../../../common/enums/workplace-type.enum.js';

export class ListJobsDto {
  @ApiPropertyOptional({
    description: 'Free-text search across title and company name.',
    example: 'backend engineer',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by normalized country.',
    example: 'Germany',
  })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({
    description: 'Filter by workplace mode.',
    enum: WorkplaceType,
    example: WorkplaceType.REMOTE,
  })
  @IsOptional()
  @IsEnum(WorkplaceType)
  workplaceType?: WorkplaceType;

  @ApiPropertyOptional({
    description: 'Filter by source slug.',
    example: 'greenhouse-board',
  })
  @IsOptional()
  @IsString()
  sourceSlug?: string;

  @ApiPropertyOptional({
    description: 'Minimum overall score (0-10).',
    example: 7.5,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(10)
  minScore?: number;

  @ApiPropertyOptional({
    description: 'Maximum overall score (0-10).',
    example: 9.5,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(10)
  maxScore?: number;

  @ApiPropertyOptional({
    description: 'Filter by explicit visa sponsorship signal.',
    example: true,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  visaSponsorshipSignal?: boolean;

  @ApiPropertyOptional({
    description: '1-based page number.',
    example: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Page size.',
    example: 25,
    default: 25,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 25;

  @ApiPropertyOptional({
    description: 'Sort field.',
    enum: ['postedAt', 'overallScore', 'createdAt'],
    example: 'overallScore',
    default: 'createdAt',
  })
  @IsOptional()
  @IsIn(['postedAt', 'overallScore', 'createdAt'])
  sortBy?: 'postedAt' | 'overallScore' | 'createdAt' = 'createdAt';

  @ApiPropertyOptional({
    description: 'Sort direction.',
    enum: ['ASC', 'DESC'],
    example: 'DESC',
    default: 'DESC',
  })
  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}
