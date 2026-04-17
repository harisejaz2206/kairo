import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { SourceType } from '../../../common/enums/source-type.enum.js';

@Entity('job_sources')
export class JobSource {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  // Human-readable identifier used in API paths and n8n payloads
  // e.g. 'greenhouse-demo', 'lever-acme', 'manual'
  @Column({ length: 100, unique: true })
  slug: string;

  @Column({ type: 'enum', enum: SourceType })
  type: SourceType;

  @Column({ type: 'varchar', length: 500, nullable: true })
  baseUrl: string | null;

  @Column({ default: true })
  isActive: boolean;

  // Stores source-specific config like API endpoints, headers, field mappings
  @Column({ type: 'jsonb', nullable: true })
  configJson: Record<string, unknown> | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
