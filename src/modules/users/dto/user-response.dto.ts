import { ApiProperty } from '@nestjs/swagger';

/**
 * Shape returned to the client — deliberately excludes passwordHash.
 * Using a dedicated response DTO prevents accidental field leaks as
 * the entity grows, even if `select: false` is ever changed.
 */
export class UserResponseDto {
  @ApiProperty({ example: '2c5086d0-2f5f-4a2a-a527-6f01a9d96a1e' })
  id: string;
  @ApiProperty({ example: 'haris@example.com' })
  email: string;
  @ApiProperty({ example: 'Haris Ejaz' })
  name: string;
  @ApiProperty({ example: '2026-04-18T12:00:00.000Z' })
  createdAt: Date;
  @ApiProperty({ example: '2026-04-18T12:00:00.000Z' })
  updatedAt: Date;

  constructor(partial: Partial<UserResponseDto>) {
    Object.assign(this, partial);
  }
}
