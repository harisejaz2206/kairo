import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { SourcesService } from './sources.service.js';
import { CreateSourceDto } from './dto/create-source.dto.js';
import { UpdateSourceDto } from './dto/update-source.dto.js';

@ApiTags('Sources')
@Controller('sources')
export class SourcesController {
  constructor(private readonly sourcesService: SourcesService) {}

  // POST /api/sources
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new job source' })
  @ApiCreatedResponse({ description: 'Source created successfully.' })
  create(@Body() dto: CreateSourceDto) {
    return this.sourcesService.create(dto);
  }

  // GET /api/sources
  @Get()
  @ApiOperation({ summary: 'List all job sources' })
  @ApiOkResponse({ description: 'Sources returned successfully.' })
  findAll() {
    return this.sourcesService.findAll();
  }

  // PATCH /api/sources/:id
  @Patch(':id')
  @ApiOperation({ summary: 'Update an existing job source' })
  @ApiParam({ name: 'id', description: 'Source UUID.' })
  @ApiOkResponse({ description: 'Source updated successfully.' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateSourceDto) {
    return this.sourcesService.update(id, dto);
  }

  // POST /api/sources/:id/activate
  @Post(':id/activate')
  @ApiOperation({ summary: 'Activate a source' })
  @ApiParam({ name: 'id', description: 'Source UUID.' })
  @ApiOkResponse({ description: 'Source activated successfully.' })
  activate(@Param('id', ParseUUIDPipe) id: string) {
    return this.sourcesService.activate(id);
  }

  // POST /api/sources/:id/deactivate
  @Post(':id/deactivate')
  @ApiOperation({ summary: 'Deactivate a source' })
  @ApiParam({ name: 'id', description: 'Source UUID.' })
  @ApiOkResponse({ description: 'Source deactivated successfully.' })
  deactivate(@Param('id', ParseUUIDPipe) id: string) {
    return this.sourcesService.deactivate(id);
  }
}
