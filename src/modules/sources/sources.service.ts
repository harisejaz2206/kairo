import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JobSource } from './entities/job-source.entity.js';
import { CreateSourceDto } from './dto/create-source.dto.js';
import { UpdateSourceDto } from './dto/update-source.dto.js';

@Injectable()
export class SourcesService {
  constructor(
    @InjectRepository(JobSource)
    private readonly sourcesRepository: Repository<JobSource>,
  ) {}

  async create(dto: CreateSourceDto): Promise<JobSource> {
    const exists = await this.sourcesRepository.existsBy({ slug: dto.slug });
    if (exists) {
      throw new ConflictException(`Source with slug '${dto.slug}' already exists`);
    }

    const source = this.sourcesRepository.create({
      name: dto.name,
      slug: dto.slug,
      type: dto.type,
      baseUrl: dto.baseUrl ?? null,
      configJson: dto.configJson ?? null,
    });

    return this.sourcesRepository.save(source);
  }

  findAll(): Promise<JobSource[]> {
    return this.sourcesRepository.find({ order: { createdAt: 'DESC' } });
  }

  async findBySlug(slug: string): Promise<JobSource> {
    const source = await this.sourcesRepository.findOneBy({ slug });
    if (!source) {
      throw new NotFoundException(`Source '${slug}' not found`);
    }
    return source;
  }

  async update(id: string, dto: UpdateSourceDto): Promise<JobSource> {
    const source = await this.findById(id);
    Object.assign(source, dto);
    return this.sourcesRepository.save(source);
  }

  async activate(id: string): Promise<JobSource> {
    const source = await this.findById(id);
    source.isActive = true;
    return this.sourcesRepository.save(source);
  }

  async deactivate(id: string): Promise<JobSource> {
    const source = await this.findById(id);
    source.isActive = false;
    return this.sourcesRepository.save(source);
  }

  async findById(id: string): Promise<JobSource> {
    const source = await this.sourcesRepository.findOneBy({ id });
    if (!source) {
      throw new NotFoundException(`Source ${id} not found`);
    }
    return source;
  }
}
