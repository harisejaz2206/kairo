import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Job } from './entities/job.entity.js';
import { JobsController } from './controllers/jobs.controller.js';
import { JobsService } from './services/jobs.service.js';
import { JobsQueryService } from './services/jobs-query.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Job])],
  controllers: [JobsController],
  providers: [JobsService, JobsQueryService],
  exports: [JobsService],
})
export class JobsModule {}
