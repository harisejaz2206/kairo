import { registerAs } from '@nestjs/config';

export default registerAs('featureFlags', () => ({
  // Score every new job automatically on ingest.
  // Set to false to disable auto-scoring (e.g. during bulk backfills).
  enableScoreOnIngest: process.env.ENABLE_SCORE_ON_INGEST !== 'false',
}));
