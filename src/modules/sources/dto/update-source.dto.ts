import {
  IsString,
  IsOptional,
  IsUrl,
  IsObject,
  MaxLength,
} from 'class-validator';

export class UpdateSourceDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  baseUrl?: string;

  @IsOptional()
  @IsObject()
  configJson?: Record<string, unknown>;
}
