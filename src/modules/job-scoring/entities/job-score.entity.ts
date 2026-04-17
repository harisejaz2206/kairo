import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Job } from '../../jobs/entities/job.entity.js';
import { CandidateProfile } from '../../candidate-profile/entities/candidate-profile.entity.js';

@Unique(['jobId', 'candidateProfileId'])
@Entity('job_scores')
export class JobScore {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Job, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'job_id' })
  job: Job;

  @Column()
  jobId: string;

  @ManyToOne(() => CandidateProfile, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'candidate_profile_id' })
  candidateProfile: CandidateProfile;

  @Column()
  candidateProfileId: string;

  // Weighted composite score (0–10)
  @Column({ type: 'numeric', precision: 4, scale: 2 })
  overallScore: number;

  @Column({ type: 'numeric', precision: 4, scale: 2, nullable: true })
  titleMatchScore: number | null;

  @Column({ type: 'numeric', precision: 4, scale: 2, nullable: true })
  stackMatchScore: number | null;

  @Column({ type: 'numeric', precision: 4, scale: 2, nullable: true })
  locationMatchScore: number | null;

  @Column({ type: 'numeric', precision: 4, scale: 2, nullable: true })
  experienceMatchScore: number | null;

  @Column({ type: 'numeric', precision: 4, scale: 2, nullable: true })
  visaSignalScore: number | null;

  @Column({ type: 'numeric', precision: 4, scale: 2, nullable: true })
  remoteMatchScore: number | null;

  // e.g. ["German language required", "10+ years expected"]
  @Column({ type: 'jsonb', default: [] })
  redFlagsJson: string[];

  // e.g. ["Strong Node.js match", "Country preference match"]
  @Column({ type: 'jsonb', default: [] })
  strengthsJson: string[];

  // Structured reasoning output from AI scoring (Phase 3)
  @Column({ type: 'jsonb', nullable: true })
  explanationJson: Record<string, unknown> | null;

  // e.g. 'rule-based-v1', 'openai-gpt4o'
  @Column({ type: 'varchar', length: 100, nullable: true })
  scoringModel: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  scoringVersion: string | null;

  @Column({ type: 'timestamp' })
  scoredAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
