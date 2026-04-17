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
import { SourcesService } from './sources.service.js';
import { CreateSourceDto } from './dto/create-source.dto.js';
import { UpdateSourceDto } from './dto/update-source.dto.js';

@Controller('sources')
export class SourcesController {
  constructor(private readonly sourcesService: SourcesService) {}

  // POST /api/sources
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateSourceDto) {
    return this.sourcesService.create(dto);
  }

  // GET /api/sources
  @Get()
  findAll() {
    return this.sourcesService.findAll();
  }

  // PATCH /api/sources/:id
  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateSourceDto) {
    return this.sourcesService.update(id, dto);
  }

  // POST /api/sources/:id/activate
  @Post(':id/activate')
  activate(@Param('id', ParseUUIDPipe) id: string) {
    return this.sourcesService.activate(id);
  }

  // POST /api/sources/:id/deactivate
  @Post(':id/deactivate')
  deactivate(@Param('id', ParseUUIDPipe) id: string) {
    return this.sourcesService.deactivate(id);
  }
}
