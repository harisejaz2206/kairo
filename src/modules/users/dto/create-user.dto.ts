import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsNotEmpty,
} from 'class-validator';

/**
 * Validated shape expected on POST /api/users.
 *
 * The global ValidationPipe (whitelist + forbidNonWhitelisted) ensures:
 *  - Extra fields are stripped before hitting the service
 *  - An unknown field causes a 400 rather than silent pass-through
 */
export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsString()
  @MinLength(8)
  @MaxLength(72) // bcrypt hard limit
  password: string;
}
