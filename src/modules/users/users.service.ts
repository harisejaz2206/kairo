import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UserResponseDto } from './dto/user-response.dto';

/**
 * All business logic lives here — controllers stay thin and testable.
 *
 * Password hashing is stubbed with a TODO; wire in bcrypt when auth is built.
 */
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(dto: CreateUserDto): Promise<UserResponseDto> {
    const exists = await this.usersRepository.existsBy({ email: dto.email });
    if (exists) {
      throw new ConflictException('A user with this email already exists');
    }

    // TODO: replace with bcrypt.hash(dto.password, 10) when auth module lands
    const passwordHash = `HASHED:${dto.password}`;

    const user = this.usersRepository.create({
      email: dto.email,
      name: dto.name,
      passwordHash,
    });

    const saved = await this.usersRepository.save(user);
    return this.toResponse(saved);
  }

  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.usersRepository.find();
    return users.map((u) => this.toResponse(u));
  }

  async findOne(id: string): Promise<UserResponseDto | null> {
    const user = await this.usersRepository.findOneBy({ id });
    return user ? this.toResponse(user) : null;
  }

  // Maps entity → response DTO, keeping password out of the response shape
  private toResponse(user: User): UserResponseDto {
    return new UserResponseDto({
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  }
}
