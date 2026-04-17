import {
  IsEnum,
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUrl,
  IsObject,
  MaxLength,
  Matches,
} from 'class-validator';
import { SourceType } from '../../../common/enums/source-type.enum.js';

export class CreateSourceDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  // Lowercase, hyphen-separated — used in API paths and n8n payloads
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @Matches(/^[a-z0-9-]+$/, {
    message: 'slug must be lowercase letters, numbers, and hyphens only',
  })
  slug: string;

  @IsEnum(SourceType)
  type: SourceType;

  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  baseUrl?: string;

  @IsOptional()
  @IsObject()
  configJson?: Record<string, unknown>;
}
