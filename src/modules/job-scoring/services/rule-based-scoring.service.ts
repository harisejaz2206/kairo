import { Injectable } from '@nestjs/common';
import { Job } from '../../jobs/entities/job.entity.js';
import { CandidateProfile } from '../../candidate-profile/entities/candidate-profile.entity.js';
import { WorkplaceType } from '../../../common/enums/workplace-type.enum.js';
import { SeniorityHint } from '../../../common/enums/seniority-hint.enum.js';

export interface ScoreBreakdown {
  overallScore: number;
  titleMatchScore: number;
  stackMatchScore: number;
  locationMatchScore: number;
  experienceMatchScore: number;
  visaSignalScore: number;
  remoteMatchScore: number;
  redFlags: string[];
  strengths: string[];
}

// Score weights — must sum to 1.0
const WEIGHTS = {
  title: 0.20,
  stack: 0.25,
  location: 0.20,
  experience: 0.15,
  visa: 0.10,
  remote: 0.10,
};

@Injectable()
export class RuleBasedScoringService {
  score(job: Job, profile: CandidateProfile): ScoreBreakdown {
    const redFlags: string[] = [];
    const strengths: string[] = [];

    const titleScore = this.scoreTitleMatch(job, profile, strengths, redFlags);
    const stackScore = this.scoreStackMatch(job, profile, strengths, redFlags);
    const locationScore = this.scoreLocationMatch(job, profile, strengths, redFlags);
    const experienceScore = this.scoreExperienceMatch(job, profile, redFlags);
    const visaScore = this.scoreVisaSignal(job, profile, strengths, redFlags);
    const remoteScore = this.scoreRemoteMatch(job, profile, strengths, redFlags);

    const overall =
      titleScore * WEIGHTS.title +
      stackScore * WEIGHTS.stack +
      locationScore * WEIGHTS.location +
      experienceScore * WEIGHTS.experience +
      visaScore * WEIGHTS.visa +
      remoteScore * WEIGHTS.remote;

    return {
      overallScore: this.round(overall),
      titleMatchScore: this.round(titleScore),
      stackMatchScore: this.round(stackScore),
      locationMatchScore: this.round(locationScore),
      experienceMatchScore: this.round(experienceScore),
      visaSignalScore: this.round(visaScore),
      remoteMatchScore: this.round(remoteScore),
      redFlags,
      strengths,
    };
  }

  // ---------------------------------------------------------------------------
  // Title match (0–10)
  // Checks how closely the job title aligns with candidate's target titles.
  // ---------------------------------------------------------------------------
  private scoreTitleMatch(
    job: Job,
    profile: CandidateProfile,
    strengths: string[],
    redFlags: string[],
  ): number {
    if (!profile.targetTitles?.length) return 5; // neutral if no preference set

    const jobTitleLower = job.title.toLowerCase();
    let best = 0;
    let matchedTitle = '';

    for (const target of profile.targetTitles) {
      const targetLower = target.toLowerCase();
      const targetWords = targetLower.split(/\s+/);
      const matchingWords = targetWords.filter((w) => jobTitleLower.includes(w));
      const ratio = matchingWords.length / targetWords.length;

      let score = 0;
      if (jobTitleLower === targetLower) score = 10;
      else if (ratio === 1) score = 9;        // all words match
      else if (ratio >= 0.66) score = 7;      // most words match
      else if (ratio >= 0.33) score = 5;      // some words match
      else if (ratio > 0) score = 3;          // at least one word matches

      if (score > best) {
        best = score;
        matchedTitle = target;
      }
    }

    // Check if excluded keywords appear in the title
    const excludedInTitle = (profile.excludedKeywords ?? []).filter((kw) =>
      jobTitleLower.includes(kw.toLowerCase()),
    );
    if (excludedInTitle.length) {
      redFlags.push(`Title contains excluded keyword(s): ${excludedInTitle.join(', ')}`);
      best = Math.max(0, best - 3);
    }

    if (best >= 7) strengths.push(`Title match: "${matchedTitle}"`);
    else if (best === 0) redFlags.push(`Title "${job.title}" does not match any target title`);

    return best;
  }

  // ---------------------------------------------------------------------------
  // Stack match (0–10)
  // Counts how many preferred keywords appear in the description + tech keywords.
  // ---------------------------------------------------------------------------
  private scoreStackMatch(
    job: Job,
    profile: CandidateProfile,
    strengths: string[],
    redFlags: string[],
  ): number {
    if (!profile.preferredKeywords?.length) return 5;

    const searchText = [
      job.descriptionText,
      job.requirementsText ?? '',
      ...(job.techKeywords ?? []),
    ]
      .join(' ')
      .toLowerCase();

    const matched = profile.preferredKeywords.filter((kw) =>
      searchText.includes(kw.toLowerCase()),
    );

    const total = profile.preferredKeywords.length;
    const ratio = matched.length / total;

    // Scale: 40% match → ~6, 60% → ~8, 80%+ → ~10
    const raw = Math.min(10, ratio * 12.5);

    if (matched.length > 0) {
      strengths.push(`Stack keywords matched: ${matched.slice(0, 5).join(', ')}${matched.length > 5 ? '…' : ''}`);
    }

    // Penalise excluded keywords in the description
    const excluded = (profile.excludedKeywords ?? []).filter((kw) =>
      searchText.includes(kw.toLowerCase()),
    );
    if (excluded.length) {
      redFlags.push(`Description contains excluded keyword(s): ${excluded.join(', ')}`);
      return Math.max(0, raw - excluded.length * 1.5);
    }

    return raw;
  }

  // ---------------------------------------------------------------------------
  // Location match (0–10)
  // Checks country and remote/hybrid preference.
  // ---------------------------------------------------------------------------
  private scoreLocationMatch(
    job: Job,
    profile: CandidateProfile,
    strengths: string[],
    redFlags: string[],
  ): number {
    const targetCountries = (profile.targetCountries ?? []).map((c) =>
      c.toLowerCase(),
    );
    const targetLocations = (profile.targetLocations ?? []).map((l) =>
      l.toLowerCase(),
    );
    const country = job.countryNormalized?.toLowerCase() ?? '';
    const city = job.cityNormalized?.toLowerCase() ?? '';

    // Exact country match — strong signal
    if (country && targetCountries.includes(country)) {
      strengths.push(`Country match: ${job.countryNormalized}`);
      if (city && targetLocations.includes(city)) {
        strengths.push(`City match: ${job.cityNormalized}`);
        return 10;
      }
      return 9;
    }

    // Remote job + candidate prefers remote → almost as good as a country match
    const preferredModes: string[] =
      (profile.remotePreferences as any)?.preferred ?? [];
    if (
      job.workplaceType === WorkplaceType.REMOTE &&
      preferredModes.includes('remote')
    ) {
      strengths.push('Remote position matches preference');
      return 8;
    }

    // Partial location match — job is in a city the candidate listed
    if (city && targetLocations.includes(city)) {
      strengths.push(`City match: ${job.cityNormalized}`);
      return 7;
    }

    if (country) {
      redFlags.push(`Country "${job.countryNormalized}" is not in target countries`);
    }

    return 0;
  }

  // ---------------------------------------------------------------------------
  // Experience match (0–10)
  // Compares candidate's years of experience against the job's seniority hint.
  // ---------------------------------------------------------------------------
  private scoreExperienceMatch(
    job: Job,
    profile: CandidateProfile,
    redFlags: string[],
  ): number {
    const years = profile.experienceYears ?? null;

    // No experience info on the profile — stay neutral
    if (years === null) return 7;

    switch (job.seniorityHint) {
      case SeniorityHint.INTERN:
        return years <= 1 ? 10 : years <= 2 ? 6 : 3;

      case SeniorityHint.JUNIOR:
        return years <= 3 ? 10 : years <= 4 ? 7 : 4;

      case SeniorityHint.MID:
        if (years >= 2 && years <= 6) return 10;
        if (years < 2) { redFlags.push('Role appears mid-level but profile has low experience'); return 5; }
        return 8; // overqualified is usually fine

      case SeniorityHint.SENIOR:
        if (years >= 5) return 10;
        if (years >= 3) { redFlags.push('Role appears senior; profile may be a stretch'); return 6; }
        redFlags.push('Role appears senior; significant experience gap');
        return 3;

      case SeniorityHint.LEAD:
      case SeniorityHint.STAFF:
        if (years >= 8) return 10;
        if (years >= 5) { redFlags.push(`Role is ${job.seniorityHint}; may require more experience`); return 5; }
        redFlags.push(`Role is ${job.seniorityHint}; experience gap likely`);
        return 2;

      case SeniorityHint.UNKNOWN:
      default:
        return 7; // no signal — stay neutral
    }
  }

  // ---------------------------------------------------------------------------
  // Visa signal (0–10)
  // Only relevant when candidate requires visa sponsorship.
  // ---------------------------------------------------------------------------
  private scoreVisaSignal(
    job: Job,
    profile: CandidateProfile,
    strengths: string[],
    redFlags: string[],
  ): number {
    const requiresSponsorship =
      (profile.visaPreferences as any)?.requiresSponsorship === true;

    if (!requiresSponsorship) return 10; // candidate doesn't need it — no penalty

    if (job.visaSponsorshipSignal === true) {
      strengths.push('Visa sponsorship available');
      return 10;
    }
    if (job.visaSponsorshipSignal === null || job.visaSponsorshipSignal === undefined) {
      return 5; // unknown — don't penalise heavily
    }

    redFlags.push('Visa sponsorship not indicated — may not qualify');
    return 0;
  }

  // ---------------------------------------------------------------------------
  // Remote / work mode match (0–10)
  // ---------------------------------------------------------------------------
  private scoreRemoteMatch(
    job: Job,
    profile: CandidateProfile,
    strengths: string[],
    redFlags: string[],
  ): number {
    const preferred: string[] =
      (profile.remotePreferences as any)?.preferred ?? [];
    const acceptable: string[] =
      (profile.remotePreferences as any)?.acceptable ?? [];

    if (!preferred.length && !acceptable.length) return 7; // no preference set

    const mode = job.workplaceType;
    if (mode === WorkplaceType.UNKNOWN) return 5;

    if (preferred.includes(mode)) {
      strengths.push(`Work mode "${mode}" matches preference`);
      return 10;
    }
    if (acceptable.includes(mode)) return 6;

    redFlags.push(`Work mode "${mode}" is not in preferred or acceptable list`);
    return 2;
  }

  private round(n: number): number {
    return Math.round(n * 100) / 100;
  }
}
