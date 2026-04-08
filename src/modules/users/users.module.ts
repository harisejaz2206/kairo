import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  // Registers the User entity with TypeORM and makes its Repository injectable
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [UsersService],
  // Export UsersService so other modules (e.g. AuthModule) can inject it
  exports: [UsersService],
})
export class UsersModule {}
