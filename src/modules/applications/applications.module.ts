import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Application } from './entities/application.entity.js';
import { ApplicationsController } from './applications.controller.js';
import { ApplicationsService } from './applications.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Application])],
  controllers: [ApplicationsController],
  providers: [ApplicationsService],
  exports: [ApplicationsService],
})
export class ApplicationsModule {}
