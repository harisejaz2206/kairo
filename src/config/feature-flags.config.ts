import { registerAs } from '@nestjs/config';

export default registerAs('featureFlags', () => ({
  // Score every new job automatically on ingest.
  // Set to false to disable auto-scoring (e.g. during bulk backfills).
  enableScoreOnIngest: process.env.ENABLE_SCORE_ON_INGEST !== 'false',

  // Enable OpenAI-assisted scoring on top of the deterministic baseline.
  // Falls back to rule-based scoring if disabled or OpenAI is not configured.
  enableAiScoring: process.env.ENABLE_AI_SCORING === 'true',

  // Generate draft assets automatically for strong matches.
  enableAutoDraftGeneration: process.env.ENABLE_AUTO_DRAFT_GENERATION === 'true',
  autoDraftScoreThreshold: parseFloat(process.env.AUTO_DRAFT_SCORE_THRESHOLD ?? '8'),
}));
