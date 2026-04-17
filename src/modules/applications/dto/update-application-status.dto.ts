import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApplicationStatus } from '../../../common/enums/application-status.enum.js';
import { Priority } from '../../../common/enums/priority.enum.js';
import { FitLabel } from '../../../common/enums/fit-label.enum.js';

export class UpdateApplicationStatusDto {
  @IsOptional()
  @IsEnum(ApplicationStatus)
  status?: ApplicationStatus;

  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;

  @IsOptional()
  @IsEnum(FitLabel)
  fitLabel?: FitLabel;

  @IsOptional()
  @IsString()
  manualNotes?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  rejectionReason?: string;
}
