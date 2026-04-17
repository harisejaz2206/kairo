import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobSource } from './entities/job-source.entity.js';
import { SourcesController } from './sources.controller.js';
import { SourcesService } from './sources.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([JobSource])],
  controllers: [SourcesController],
  providers: [SourcesService],
  exports: [SourcesService],
})
export class SourcesModule {}
