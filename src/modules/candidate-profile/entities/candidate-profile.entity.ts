import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('candidate_profiles')
export class CandidateProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  displayName: string;

  // e.g. ["Backend Engineer", "Software Engineer", "Node.js Engineer"]
  @Column({ type: 'jsonb', default: [] })
  targetTitles: string[];

  // e.g. ["Germany", "Netherlands"]
  @Column({ type: 'jsonb', default: [] })
  targetCountries: string[];

  // e.g. ["Berlin", "Amsterdam"] — optional city-level preference
  @Column({ type: 'jsonb', nullable: true })
  targetLocations: string[] | null;

  // Keywords that boost relevance during scoring
  @Column({ type: 'jsonb', default: [] })
  preferredKeywords: string[];

  // Jobs containing these keywords are deprioritised or filtered
  @Column({ type: 'jsonb', default: [] })
  excludedKeywords: string[];

  // Hard requirements — job must match all of these to score above threshold
  @Column({ type: 'jsonb', default: [] })
  mustHaveRules: string[];

  // Nice-to-haves — improve score but don't disqualify
  @Column({ type: 'jsonb', default: [] })
  niceToHaveRules: string[];

  // e.g. { preferred: ["remote", "hybrid"], acceptable: ["onsite"] }
  @Column({ type: 'jsonb', nullable: true })
  remotePreferences: Record<string, unknown> | null;

  // e.g. { requiresSponsorship: true, currentStatus: "requires_visa" }
  @Column({ type: 'jsonb', nullable: true })
  visaPreferences: Record<string, unknown> | null;

  @Column({ type: 'numeric', precision: 4, scale: 1, nullable: true })
  experienceYears: number | null;

  // Free-text summary of tech stack used during AI scoring prompts
  @Column({ type: 'text', nullable: true })
  stackSummary: string | null;

  // Full resume text injected into AI prompt context for draft generation
  @Column({ type: 'text', nullable: true })
  masterResumeText: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
