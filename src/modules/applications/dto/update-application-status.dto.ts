import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ApplicationStatus } from '../../../common/enums/application-status.enum.js';
import { Priority } from '../../../common/enums/priority.enum.js';
import { FitLabel } from '../../../common/enums/fit-label.enum.js';

export class UpdateApplicationStatusDto {
  @ApiPropertyOptional({
    description: 'New application status.',
    enum: ApplicationStatus,
    example: ApplicationStatus.SHORTLISTED,
  })
  @IsOptional()
  @IsEnum(ApplicationStatus)
  status?: ApplicationStatus;

  @ApiPropertyOptional({
    description: 'Priority label used for dashboard review.',
    enum: Priority,
    example: Priority.HIGH,
  })
  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;

  @ApiPropertyOptional({
    description: 'Fit label assigned after human review.',
    enum: FitLabel,
    example: FitLabel.STRONG,
  })
  @IsOptional()
  @IsEnum(FitLabel)
  fitLabel?: FitLabel;

  @ApiPropertyOptional({
    description: 'Free-form reviewer notes for this application.',
    example: 'Strong fit for backend stack, worth applying this week.',
  })
  @IsOptional()
  @IsString()
  manualNotes?: string;

  @ApiPropertyOptional({
    description: 'Optional rejection reason for tracking and later analysis.',
    example: 'Role closed before application submission.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  rejectionReason?: string;
}
