import { IsOptional, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { IsNumber, Min, Max } from 'class-validator';
import { ApplicationStatus } from '../../../common/enums/application-status.enum.js';
import { Priority } from '../../../common/enums/priority.enum.js';

export class ListApplicationsDto {
  @IsOptional()
  @IsEnum(ApplicationStatus)
  status?: ApplicationStatus;

  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;

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
}
