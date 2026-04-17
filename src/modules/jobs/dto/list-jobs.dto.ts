import { Type } from 'class-transformer';
import {
  IsOptional,
  IsString,
  IsEnum,
  IsBoolean,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { WorkplaceType } from '../../../common/enums/workplace-type.enum.js';

export class ListJobsDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsEnum(WorkplaceType)
  workplaceType?: WorkplaceType;

  @IsOptional()
  @IsString()
  sourceSlug?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(10)
  minScore?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(10)
  maxScore?: number;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  visaSponsorshipSignal?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 25;

  @IsOptional()
  @IsEnum(['postedAt', 'createdAt'])
  sortBy?: 'postedAt' | 'createdAt' = 'createdAt';

  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}
