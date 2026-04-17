import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Job } from '../../jobs/entities/job.entity.js';
import { CandidateProfile } from '../../candidate-profile/entities/candidate-profile.entity.js';
import { ScoreBreakdown } from './rule-based-scoring.service.js';
import { OpenAiClientService } from '../../../integrations/openai/services/openai-client.service.js';

interface AiScoreExplanation {
  summary: string;
  recommendation: 'apply' | 'consider' | 'skip';
  rationale: string[];
  candidateRisks: string[];
  confidence: number;
}

interface AiJobScoreResponse {
  overallScore: number;
  titleMatchScore: number;
  stackMatchScore: number;
  locationMatchScore: number;
  experienceMatchScore: number;
  visaSignalScore: number;
  remoteMatchScore: number;
  strengths: string[];
  redFlags: string[];
  explanation: AiScoreExplanation;
}

export interface AiAssistedScoreResult extends ScoreBreakdown {
  explanation: {
    ruleBasedBaseline: ScoreBreakdown;
    aiAssessment: AiScoreExplanation;
    openAiResponseId: string;
  };
  scoringModel: string;
  scoringVersion: string;
}

const AI_SCORE_SCHEMA = {
  type: 'object',
  properties: {
    overallScore: { type: 'number' },
    titleMatchScore: { type: 'number' },
    stackMatchScore: { type: 'number' },
    locationMatchScore: { type: 'number' },
    experienceMatchScore: { type: 'number' },
    visaSignalScore: { type: 'number' },
    remoteMatchScore: { type: 'number' },
    strengths: {
      type: 'array',
      items: { type: 'string' },
    },
    redFlags: {
      type: 'array',
      items: { type: 'string' },
    },
    explanation: {
      type: 'object',
      properties: {
        summary: { type: 'string' },
        recommendation: {
          type: 'string',
          enum: ['apply', 'consider', 'skip'],
        },
        rationale: {
          type: 'array',
          items: { type: 'string' },
        },
        candidateRisks: {
          type: 'array',
          items: { type: 'string' },
        },
        confidence: { type: 'number' },
      },
      required: [
        'summary',
        'recommendation',
        'rationale',
        'candidateRisks',
        'confidence',
      ],
      additionalProperties: false,
    },
  },
  required: [
    'overallScore',
    'titleMatchScore',
    'stackMatchScore',
    'locationMatchScore',
    'experienceMatchScore',
    'visaSignalScore',
    'remoteMatchScore',
    'strengths',
    'redFlags',
    'explanation',
  ],
  additionalProperties: false,
} as const;

@Injectable()
export class AiJobScoringService {
  private readonly logger = new Logger(AiJobScoringService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly openAiClientService: OpenAiClientService,
  ) {}

  isEnabled(): boolean {
    return (
      (this.configService.get<boolean>('featureFlags.enableAiScoring') ?? false) &&
      this.openAiClientService.isConfigured()
    );
  }

  async score(
    job: Job,
    profile: CandidateProfile,
    ruleBased: ScoreBreakdown,
  ): Promise<AiAssistedScoreResult | null> {
    if (!this.isEnabled()) {
      return null;
    }

    try {
      const client = this.openAiClientService.createClient();
      const model = this.openAiClientService.getModel();
      const reasoningEffort = this.openAiClientService.getReasoningEffort();

      const response = await client.responses.create({
        model,
        reasoning: { effort: reasoningEffort as 'low' | 'medium' | 'high' | 'minimal' | 'none' },
        input: [
          {
            role: 'system',
            content: [
              {
                type: 'input_text',
                text:
                  'You score software engineering jobs for one candidate. Return JSON only. Stay grounded in the provided profile and job data. Do not invent experience or qualifications. Use the rule-based baseline as a reference point, but improve nuance where helpful.',
              },
            ],
          },
          {
            role: 'user',
            content: [
              {
                type: 'input_text',
                text: JSON.stringify({
                  candidateProfile: {
                    displayName: profile.displayName,
                    targetTitles: profile.targetTitles,
                    targetCountries: profile.targetCountries,
                    targetLocations: profile.targetLocations,
                    preferredKeywords: profile.preferredKeywords,
                    excludedKeywords: profile.excludedKeywords,
                    mustHaveRules: profile.mustHaveRules,
                    niceToHaveRules: profile.niceToHaveRules,
                    remotePreferences: profile.remotePreferences,
                    visaPreferences: profile.visaPreferences,
                    experienceYears: profile.experienceYears,
                    stackSummary: profile.stackSummary,
                    masterResumeText: profile.masterResumeText,
                  },
                  job: {
                    companyName: job.companyName,
                    title: job.title,
                    countryNormalized: job.countryNormalized,
                    cityNormalized: job.cityNormalized,
                    locationRaw: job.locationRaw,
                    workplaceType: job.workplaceType,
                    employmentType: job.employmentType,
                    seniorityHint: job.seniorityHint,
                    visaSponsorshipSignal: job.visaSponsorshipSignal,
                    relocationSupported: job.relocationSupported,
                    languageRequirements: job.languageRequirements,
                    descriptionText: job.descriptionText,
                    requirementsText: job.requirementsText,
                    techKeywords: job.techKeywords,
                  },
                  ruleBasedBaseline: ruleBased,
                  instructions: {
                    scoreRange: '0 to 10 inclusive',
                    scoreComponents: [
                      'titleMatchScore',
                      'stackMatchScore',
                      'locationMatchScore',
                      'experienceMatchScore',
                      'visaSignalScore',
                      'remoteMatchScore',
                    ],
                    strengthsLimit: 5,
                    redFlagsLimit: 5,
                    explanationRequirements: [
                      'Write a short summary of fit.',
                      'Set recommendation to apply, consider, or skip.',
                      'List the main reasons behind the score.',
                      'List concrete candidate risks or gaps.',
                      'Set confidence from 0 to 1.',
                    ],
                  },
                }),
              },
            ],
          },
        ],
        text: {
          format: {
            type: 'json_schema',
            name: 'job_score',
            strict: true,
            schema: AI_SCORE_SCHEMA,
          },
        },
      });

      if (!response.output_text) {
        this.logger.warn(`OpenAI scoring returned no output text for job ${job.id}`);
        return null;
      }

      const parsed = JSON.parse(response.output_text) as unknown;
      const aiScore = this.validateAiScoreResponse(parsed);

      return {
        overallScore: aiScore.overallScore,
        titleMatchScore: aiScore.titleMatchScore,
        stackMatchScore: aiScore.stackMatchScore,
        locationMatchScore: aiScore.locationMatchScore,
        experienceMatchScore: aiScore.experienceMatchScore,
        visaSignalScore: aiScore.visaSignalScore,
        remoteMatchScore: aiScore.remoteMatchScore,
        strengths: aiScore.strengths,
        redFlags: aiScore.redFlags,
        explanation: {
          ruleBasedBaseline: ruleBased,
          aiAssessment: aiScore.explanation,
          openAiResponseId: response.id,
        },
        scoringModel: model,
        scoringVersion: 'ai-assisted-v1',
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(`Falling back to rule-based scoring for job ${job.id}: ${message}`);
      return null;
    }
  }

  private validateAiScoreResponse(payload: unknown): AiJobScoreResponse {
    if (!payload || typeof payload !== 'object') {
      throw new Error('AI score response must be an object');
    }

    const response = payload as Record<string, unknown>;

    return {
      overallScore: this.validateScoreValue(response.overallScore, 'overallScore'),
      titleMatchScore: this.validateScoreValue(response.titleMatchScore, 'titleMatchScore'),
      stackMatchScore: this.validateScoreValue(response.stackMatchScore, 'stackMatchScore'),
      locationMatchScore: this.validateScoreValue(response.locationMatchScore, 'locationMatchScore'),
      experienceMatchScore: this.validateScoreValue(response.experienceMatchScore, 'experienceMatchScore'),
      visaSignalScore: this.validateScoreValue(response.visaSignalScore, 'visaSignalScore'),
      remoteMatchScore: this.validateScoreValue(response.remoteMatchScore, 'remoteMatchScore'),
      strengths: this.validateStringArray(response.strengths, 'strengths'),
      redFlags: this.validateStringArray(response.redFlags, 'redFlags'),
      explanation: this.validateExplanation(response.explanation),
    };
  }

  private validateScoreValue(value: unknown, field: string): number {
    if (typeof value !== 'number' || Number.isNaN(value) || value < 0 || value > 10) {
      throw new Error(`${field} must be a number between 0 and 10`);
    }

    return Math.round(value * 100) / 100;
  }

  private validateStringArray(value: unknown, field: string): string[] {
    if (!Array.isArray(value) || value.some((item) => typeof item !== 'string')) {
      throw new Error(`${field} must be a string array`);
    }

    return value;
  }

  private validateExplanation(value: unknown): AiScoreExplanation {
    if (!value || typeof value !== 'object') {
      throw new Error('explanation must be an object');
    }

    const explanation = value as Record<string, unknown>;
    const confidence = explanation.confidence;

    if (typeof explanation.summary !== 'string') {
      throw new Error('explanation.summary must be a string');
    }
    if (
      explanation.recommendation !== 'apply' &&
      explanation.recommendation !== 'consider' &&
      explanation.recommendation !== 'skip'
    ) {
      throw new Error('explanation.recommendation must be apply, consider, or skip');
    }
    if (
      typeof confidence !== 'number' ||
      Number.isNaN(confidence) ||
      confidence < 0 ||
      confidence > 1
    ) {
      throw new Error('explanation.confidence must be a number between 0 and 1');
    }

    return {
      summary: explanation.summary,
      recommendation: explanation.recommendation,
      rationale: this.validateStringArray(explanation.rationale, 'explanation.rationale'),
      candidateRisks: this.validateStringArray(
        explanation.candidateRisks,
        'explanation.candidateRisks',
      ),
      confidence: Math.round(confidence * 100) / 100,
    };
  }
}
