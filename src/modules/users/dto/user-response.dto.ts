/**
 * Shape returned to the client — deliberately excludes passwordHash.
 * Using a dedicated response DTO prevents accidental field leaks as
 * the entity grows, even if `select: false` is ever changed.
 */
export class UserResponseDto {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<UserResponseDto>) {
    Object.assign(this, partial);
  }
}
