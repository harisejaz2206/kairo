import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { JobSource } from '../../sources/entities/job-source.entity.js';
import { WorkplaceType } from '../../../common/enums/workplace-type.enum.js';
import { EmploymentType } from '../../../common/enums/employment-type.enum.js';
import { SeniorityHint } from '../../../common/enums/seniority-hint.enum.js';

@Entity('jobs')
export class Job {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => JobSource, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'source_id' })
  source: JobSource;

  @Column()
  sourceId: string;

  // Provider's own job ID — used as primary dedupe signal with sourceId
  @Column({ type: 'varchar', length: 255, nullable: true })
  externalJobId: string | null;

  // Provider's own company ID — for future company-level grouping
  @Column({ type: 'varchar', length: 255, nullable: true })
  externalCompanyId: string | null;

  @Column({ type: 'text' })
  sourceJobUrl: string;

  @Column({ length: 255 })
  companyName: string;

  @Column({ length: 255 })
  title: string;

  // Raw location string as received from the source
  @Column({ type: 'varchar', length: 255, nullable: true })
  locationRaw: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  cityNormalized: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  countryNormalized: string | null;

  @Column({ type: 'enum', enum: WorkplaceType, default: WorkplaceType.UNKNOWN })
  workplaceType: WorkplaceType;

  @Column({
    type: 'enum',
    enum: EmploymentType,
    default: EmploymentType.UNKNOWN,
  })
  employmentType: EmploymentType;

  @Column({ type: 'enum', enum: SeniorityHint, default: SeniorityHint.UNKNOWN })
  seniorityHint: SeniorityHint;

  // e.g. [{ language: "German", level: "preferred" }]
  @Column({ type: 'jsonb', nullable: true })
  languageRequirements: Record<string, unknown>[] | null;

  @Column({ type: 'boolean', nullable: true })
  relocationSupported: boolean | null;

  @Column({ type: 'boolean', nullable: true })
  visaSponsorshipSignal: boolean | null;

  @Column({ type: 'text' })
  descriptionText: string;

  @Column({ type: 'text', nullable: true })
  requirementsText: string | null;

  // Extracted tech keywords — used in scoring and filtering
  @Column({ type: 'jsonb', nullable: true })
  techKeywords: string[] | null;

  @Column({ type: 'timestamp', nullable: true })
  postedAt: Date | null;

  // When this backend fetched/received the job
  @Column({ type: 'timestamp' })
  fetchedAt: Date;

  // First time this job was ever seen
  @Column({ type: 'timestamp' })
  firstSeenAt: Date;

  // Updated on every re-ingestion to detect stale listings
  @Column({ type: 'timestamp' })
  lastSeenAt: Date;

  // Full original payload for debugging and re-processing
  @Column({ type: 'jsonb' })
  sourcePayloadJson: Record<string, unknown>;

  // SHA-256 of company + title + location + trimmed description
  // Catches identical listings reposted with a new ID
  @Index()
  @Column({ type: 'varchar', length: 64 })
  contentHash: string;

  // normalize(company)::normalize(title)::normalize(country)
  // Catches same role posted multiple times with minor variations
  @Index()
  @Column({ type: 'varchar', length: 500 })
  dedupeKey: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Back-relations — not loaded by default; used in explicit joins
  @OneToMany('JobScore', 'job')
  scores: unknown[];

  @OneToOne('Application', 'job')
  application: unknown;
}
