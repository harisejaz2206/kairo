import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job } from '../../jobs/entities/job.entity.js';
import { CandidateProfile } from '../../candidate-profile/entities/candidate-profile.entity.js';
import { JobScore } from '../entities/job-score.entity.js';
import { RuleBasedScoringService } from './rule-based-scoring.service.js';
import { CandidateProfileService } from '../../candidate-profile/candidate-profile.service.js';
import { AiJobScoringService } from './ai-job-scoring.service.js';
import { DraftGenerationService } from '../../drafts/services/draft-generation.service.js';

const RULE_BASED_MODEL = 'rule-based';
const RULE_BASED_VERSION = 'v1';

@Injectable()
export class JobScoringService {
  constructor(
    @InjectRepository(JobScore)
    private readonly jobScoresRepository: Repository<JobScore>,
    @InjectRepository(Job)
    private readonly jobsRepository: Repository<Job>,
    private readonly candidateProfileService: CandidateProfileService,
    private readonly ruleBasedScoringService: RuleBasedScoringService,
    private readonly aiJobScoringService: AiJobScoringService,
    private readonly draftGenerationService: DraftGenerationService,
  ) {}

  async scoreJob(job: Job, profile: CandidateProfile): Promise<JobScore> {
    const ruleBasedBreakdown = this.ruleBasedScoringService.score(job, profile);
    const aiBreakdown = await this.aiJobScoringService.score(
      job,
      profile,
      ruleBasedBreakdown,
    );
    const breakdown = aiBreakdown ?? ruleBasedBreakdown;
    const scoredAt = new Date();

    const existingScore = await this.jobScoresRepository.findOneBy({
      jobId: job.id,
      candidateProfileId: profile.id,
    });

    const score = existingScore ?? this.jobScoresRepository.create({
      jobId: job.id,
      candidateProfileId: profile.id,
    });

    Object.assign(score, {
      overallScore: breakdown.overallScore,
      titleMatchScore: breakdown.titleMatchScore,
      stackMatchScore: breakdown.stackMatchScore,
      locationMatchScore: breakdown.locationMatchScore,
      experienceMatchScore: breakdown.experienceMatchScore,
      visaSignalScore: breakdown.visaSignalScore,
      remoteMatchScore: breakdown.remoteMatchScore,
      redFlagsJson: breakdown.redFlags,
      strengthsJson: breakdown.strengths,
      explanationJson: aiBreakdown?.explanation ?? null,
      scoringModel: aiBreakdown?.scoringModel ?? RULE_BASED_MODEL,
      scoringVersion: aiBreakdown?.scoringVersion ?? RULE_BASED_VERSION,
      scoredAt,
    });

    const savedScore = await this.jobScoresRepository.save(score);

    await this.draftGenerationService.maybeGenerateForStrongMatch(savedScore);

    return savedScore;
  }

  async scoreJobById(jobId: string): Promise<JobScore> {
    const profile = await this.candidateProfileService.getProfile();
    const job = await this.jobsRepository.findOneByOrFail({ id: jobId });

    return this.scoreJob(job, profile);
  }

  async backfillUnscoredJobs(): Promise<{
    totalCandidates: number;
    scored: number;
    skipped: number;
    jobIds: string[];
  }> {
    const profile = await this.candidateProfileService.getProfile();

    const jobs = await this.jobsRepository
      .createQueryBuilder('job')
      .leftJoin(
        'job_scores',
        'score',
        'score.job_id = job.id AND score.candidate_profile_id = :candidateProfileId',
        { candidateProfileId: profile.id },
      )
      .where('job.is_active = true')
      .andWhere('score.id IS NULL')
      .orderBy('job.created_at', 'ASC')
      .getMany();

    const scoredJobIds: string[] = [];

    for (const job of jobs) {
      await this.scoreJob(job, profile);
      scoredJobIds.push(job.id);
    }

    return {
      totalCandidates: jobs.length,
      scored: scoredJobIds.length,
      skipped: 0,
      jobIds: scoredJobIds,
    };
  }
}
