import 'dotenv/config';
import dataSource from '../../ormconfig.js';
import { JobSource } from '../../modules/sources/entities/job-source.entity.js';
import { SourceType } from '../../common/enums/source-type.enum.js';

const DEFAULT_SOURCES: Partial<JobSource>[] = [
  {
    name: 'Manual Entry',
    slug: 'manual',
    type: SourceType.MANUAL,
    baseUrl: null,
    isActive: true,
    configJson: null,
  },
  {
    name: 'Greenhouse (Generic)',
    slug: 'greenhouse',
    type: SourceType.GREENHOUSE,
    baseUrl: 'https://boards-api.greenhouse.io/v1/boards',
    isActive: true,
    configJson: null,
  },
  {
    name: 'Lever (Generic)',
    slug: 'lever',
    type: SourceType.LEVER,
    baseUrl: 'https://api.lever.co/v0/postings',
    isActive: true,
    configJson: null,
  },
  {
    name: 'LinkedIn Job Alerts',
    slug: 'linkedin-alerts',
    type: SourceType.WEBHOOK,
    baseUrl: null,
    isActive: true,
    configJson: { note: 'Populated via n8n email parser workflow' },
  },
];

async function run() {
  await dataSource.initialize();
  const repo = dataSource.getRepository(JobSource);

  for (const sourceData of DEFAULT_SOURCES) {
    const exists = await repo.existsBy({ slug: sourceData.slug });
    if (exists) {
      console.log(`Source '${sourceData.slug}' already exists — skipping.`);
      continue;
    }

    const source = repo.create(sourceData);
    await repo.save(source);
    console.log(`Created source: ${source.slug}`);
  }

  console.log('Sources seed complete.');
  await dataSource.destroy();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
