import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { JobsService } from '../services/jobs.service.js';
import { JobsQueryService } from '../services/jobs-query.service.js';
import { ListJobsDto } from '../dto/list-jobs.dto.js';

@Controller('jobs')
export class JobsController {
  constructor(
    private readonly jobsService: JobsService,
    private readonly jobsQueryService: JobsQueryService,
  ) {}

  // GET /api/jobs?search=&country=&workplaceType=&page=1&limit=25
  @Get()
  findAll(@Query() query: ListJobsDto) {
    return this.jobsQueryService.findAll(query);
  }

  // GET /api/jobs/:id
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.jobsService.findOne(id);
  }

  // PATCH /api/jobs/:id/archive
  @Patch(':id/archive')
  archive(@Param('id', ParseUUIDPipe) id: string) {
    return this.jobsService.archive(id);
  }
}
