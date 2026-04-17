import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Validated shape expected on POST /api/users.
 *
 * The global ValidationPipe (whitelist + forbidNonWhitelisted) ensures:
 *  - Extra fields are stripped before hitting the service
 *  - An unknown field causes a 400 rather than silent pass-through
 */
export class CreateUserDto {
  @ApiProperty({
    description: 'User email address.',
    example: 'haris@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Display name for the user.',
    example: 'Haris Ejaz',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'User password. Must be between 8 and 72 characters.',
    example: 'correct-horse-battery-staple',
  })
  @IsString()
  @MinLength(8)
  @MaxLength(72) // bcrypt hard limit
  password: string;
}
