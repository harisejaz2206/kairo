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
import { ApplicationStatus } from '../../../common/enums/application-status.enum.js';
import { Priority } from '../../../common/enums/priority.enum.js';
import { FitLabel } from '../../../common/enums/fit-label.enum.js';

// One application record per job per candidate profile
@Unique(['jobId', 'candidateProfileId'])
@Entity('applications')
export class Application {
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

  @Column({
    type: 'enum',
    enum: ApplicationStatus,
    default: ApplicationStatus.NEW,
  })
  status: ApplicationStatus;

  @Column({ type: 'enum', enum: Priority, default: Priority.MEDIUM })
  priority: Priority;

  @Column({ type: 'enum', enum: FitLabel, nullable: true })
  fitLabel: FitLabel | null;

  @Column({ type: 'text', nullable: true })
  manualNotes: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  rejectionReason: string | null;

  // Set once when status transitions to APPLIED — never overwritten
  @Column({ type: 'timestamp', nullable: true })
  appliedAt: Date | null;

  @Column({ type: 'timestamp' })
  lastStatusChangedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
