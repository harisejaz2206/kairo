import {
  Controller,
  Get,
  Patch,
  Post,
  Param,
  Query,
  Body,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { ApplicationsService } from './applications.service.js';
import { ListApplicationsDto } from './dto/list-applications.dto.js';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto.js';
import { DraftGenerationService } from '../drafts/services/draft-generation.service.js';
import { ApplicationStatus } from '../../common/enums/application-status.enum.js';
import { Priority } from '../../common/enums/priority.enum.js';

@ApiTags('Applications')
@Controller('applications')
export class ApplicationsController {
  constructor(
    private readonly applicationsService: ApplicationsService,
    private readonly draftGenerationService: DraftGenerationService,
  ) {}

  // GET /api/applications?status=shortlisted&priority=high&page=1
  @Get()
  @ApiOperation({ summary: 'List applications with workflow filters' })
  @ApiQuery({ name: 'status', required: false, enum: ApplicationStatus })
  @ApiQuery({ name: 'priority', required: false, enum: Priority })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiOkResponse({ description: 'Paginated applications list returned successfully.' })
  findAll(@Query() query: ListApplicationsDto) {
    return this.applicationsService.findAll(query);
  }

  // GET /api/applications/:id
  @Get(':id')
  @ApiOperation({ summary: 'Get one application with related job context' })
  @ApiParam({ name: 'id', description: 'Application UUID.' })
  @ApiOkResponse({ description: 'Application returned successfully.' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.applicationsService.findOne(id);
  }

  // PATCH /api/applications/:id
  @Patch(':id')
  @ApiOperation({ summary: 'Update application workflow status and review fields' })
  @ApiParam({ name: 'id', description: 'Application UUID.' })
  @ApiBody({ type: UpdateApplicationStatusDto })
  @ApiOkResponse({ description: 'Application updated successfully.' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateApplicationStatusDto,
  ) {
    return this.applicationsService.update(id, dto);
  }

  // POST /api/applications/:id/generate-drafts
  @Post(':id/generate-drafts')
  @ApiOperation({ summary: 'Generate draft assets for an application' })
  @ApiParam({ name: 'id', description: 'Application UUID.' })
  @ApiOkResponse({ description: 'Draft generation completed.' })
  generateDrafts(@Param('id', ParseUUIDPipe) id: string) {
    return this.draftGenerationService.generateForApplication(id);
  }

  // GET /api/applications/:id/drafts
  @Get(':id/drafts')
  @ApiOperation({ summary: 'List saved draft assets for an application' })
  @ApiParam({ name: 'id', description: 'Application UUID.' })
  @ApiOkResponse({ description: 'Draft assets returned successfully.' })
  getDrafts(@Param('id', ParseUUIDPipe) id: string) {
    return this.draftGenerationService.listForApplication(id);
  }
}
