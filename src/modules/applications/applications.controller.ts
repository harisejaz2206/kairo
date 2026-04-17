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
import { ApplicationsService } from './applications.service.js';
import { ListApplicationsDto } from './dto/list-applications.dto.js';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto.js';
import { DraftGenerationService } from '../drafts/services/draft-generation.service.js';

@Controller('applications')
export class ApplicationsController {
  constructor(
    private readonly applicationsService: ApplicationsService,
    private readonly draftGenerationService: DraftGenerationService,
  ) {}

  // GET /api/applications?status=shortlisted&priority=high&page=1
  @Get()
  findAll(@Query() query: ListApplicationsDto) {
    return this.applicationsService.findAll(query);
  }

  // GET /api/applications/:id
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.applicationsService.findOne(id);
  }

  // PATCH /api/applications/:id
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateApplicationStatusDto,
  ) {
    return this.applicationsService.update(id, dto);
  }

  // POST /api/applications/:id/generate-drafts
  @Post(':id/generate-drafts')
  generateDrafts(@Param('id', ParseUUIDPipe) id: string) {
    return this.draftGenerationService.generateForApplication(id);
  }

  // GET /api/applications/:id/drafts
  @Get(':id/drafts')
  getDrafts(@Param('id', ParseUUIDPipe) id: string) {
    return this.draftGenerationService.listForApplication(id);
  }
}
