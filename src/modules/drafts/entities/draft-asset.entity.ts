import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Application } from '../../applications/entities/application.entity.js';
import { DraftAssetType } from '../../../common/enums/draft-asset-type.enum.js';

@Entity('draft_assets')
export class DraftAsset {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Application, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'application_id' })
  application: Application;

  @Column()
  applicationId: string;

  @Column({ type: 'enum', enum: DraftAssetType })
  type: DraftAssetType;

  // Generated text content (summary, bullets, cover note, outreach message)
  @Column({ type: 'text' })
  content: string;

  // Stores prompt metadata, token count, generation params — useful for debugging
  @Column({ type: 'jsonb', nullable: true })
  metadataJson: Record<string, unknown> | null;

  // e.g. 'gpt-4o', 'gpt-4o-mini'
  @Column({ type: 'varchar', length: 100, nullable: true })
  modelName: string | null;

  // Incremented on regeneration so history is preserved
  @Column({ type: 'varchar', length: 50, nullable: true })
  version: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
