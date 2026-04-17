import {
  Controller,
  Get,
  Patch,
  Post,
  Param,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { JobsService } from '../services/jobs.service.js';
import { JobsQueryService } from '../services/jobs-query.service.js';
import { ListJobsDto } from '../dto/list-jobs.dto.js';

@ApiTags('Jobs')
@Controller('jobs')
export class JobsController {
  constructor(
    private readonly jobsService: JobsService,
    private readonly jobsQueryService: JobsQueryService,
  ) {}

  // GET /api/jobs?search=&country=&workplaceType=&page=1&limit=25
  @Get()
  @ApiOperation({ summary: 'List jobs with filters and score-based sorting' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'country', required: false })
  @ApiQuery({ name: 'workplaceType', required: false })
  @ApiQuery({ name: 'sourceSlug', required: false })
  @ApiQuery({ name: 'minScore', required: false, type: Number })
  @ApiQuery({ name: 'maxScore', required: false, type: Number })
  @ApiQuery({ name: 'visaSponsorshipSignal', required: false, type: Boolean })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'sortBy', required: false, enum: ['postedAt', 'overallScore', 'createdAt'] })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'] })
  @ApiOkResponse({ description: 'Paginated jobs list returned successfully.' })
  findAll(@Query() query: ListJobsDto) {
    return this.jobsQueryService.findAll(query);
  }

  // GET /api/jobs/:id
  @Get(':id')
  @ApiOperation({ summary: 'Get one job with source, latest score, and application state' })
  @ApiParam({ name: 'id', description: 'Job UUID.' })
  @ApiOkResponse({ description: 'Job returned successfully.' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.jobsService.findOne(id);
  }

  // PATCH /api/jobs/:id/archive
  @Patch(':id/archive')
  @ApiOperation({ summary: 'Archive or hide a job from the active list' })
  @ApiParam({ name: 'id', description: 'Job UUID.' })
  @ApiOkResponse({ description: 'Job archived successfully.' })
  archive(@Param('id', ParseUUIDPipe) id: string) {
    return this.jobsService.archive(id);
  }

  // POST /api/jobs/:id/rescore
  @Post(':id/rescore')
  @ApiOperation({ summary: 'Trigger manual re-scoring for a job' })
  @ApiParam({ name: 'id', description: 'Job UUID.' })
  @ApiOkResponse({ description: 'Job re-scored successfully.' })
  rescore(@Param('id', ParseUUIDPipe) id: string) {
    return this.jobsService.rescore(id);
  }
}
