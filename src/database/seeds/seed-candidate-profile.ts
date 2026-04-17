import 'dotenv/config';
import dataSource from '../../ormconfig.js';
import { CandidateProfile } from '../../modules/candidate-profile/entities/candidate-profile.entity.js';

async function run() {
  await dataSource.initialize();
  const repo = dataSource.getRepository(CandidateProfile);

  const existing = await repo.findOne({ where: {} });
  if (existing) {
    console.log('Candidate profile already exists — skipping.');
    await dataSource.destroy();
    return;
  }

  const profile = repo.create({
    displayName: 'Haris Ejaz',
    targetTitles: [
      'Backend Engineer',
      'Software Engineer',
      'Node.js Engineer',
      'NestJS Developer',
    ],
    targetCountries: ['Germany', 'Netherlands', 'United Kingdom'],
    targetLocations: ['Berlin', 'Amsterdam', 'London'],
    preferredKeywords: ['Node.js', 'NestJS', 'TypeScript', 'PostgreSQL', 'REST API'],
    excludedKeywords: ['PHP', 'WordPress', 'Magento'],
    mustHaveRules: [],
    niceToHaveRules: [],
    remotePreferences: { preferred: ['remote', 'hybrid'], acceptable: ['onsite'] },
    visaPreferences: { requiresSponsorship: true },
    experienceYears: null,
    stackSummary: 'Node.js, NestJS, TypeScript, PostgreSQL, TypeORM, REST APIs',
    masterResumeText: null,
  });

  await repo.save(profile);
  console.log(`Candidate profile created: ${profile.id}`);
  await dataSource.destroy();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
