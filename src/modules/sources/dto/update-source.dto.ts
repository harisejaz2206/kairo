import {
  IsString,
  IsOptional,
  IsUrl,
  IsObject,
  MaxLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateSourceDto {
  @ApiPropertyOptional({
    description: 'Updated human-friendly source name.',
    example: 'Greenhouse Board',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({
    description: 'Updated base URL for the source.',
    example: 'https://boards.greenhouse.io',
  })
  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  baseUrl?: string;

  @ApiPropertyOptional({
    description: 'Updated source-specific configuration JSON.',
    example: { boardToken: 'acme' },
    type: 'object',
    additionalProperties: true,
  })
  @IsOptional()
  @IsObject()
  configJson?: Record<string, unknown>;
}
