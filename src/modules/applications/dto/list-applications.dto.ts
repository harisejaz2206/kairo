import { IsOptional, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { IsNumber, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ApplicationStatus } from '../../../common/enums/application-status.enum.js';
import { Priority } from '../../../common/enums/priority.enum.js';

export class ListApplicationsDto {
  @ApiPropertyOptional({
    description: 'Filter applications by status.',
    enum: ApplicationStatus,
    example: ApplicationStatus.SHORTLISTED,
  })
  @IsOptional()
  @IsEnum(ApplicationStatus)
  status?: ApplicationStatus;

  @ApiPropertyOptional({
    description: 'Filter applications by priority.',
    enum: Priority,
    example: Priority.HIGH,
  })
  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;

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
}
