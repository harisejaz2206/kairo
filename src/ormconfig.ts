import 'dotenv/config';
import { DataSource } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { join } from 'path';

/**
 * Standalone DataSource for the TypeORM CLI.
 * Used exclusively by migration.sh — NOT by the running NestJS app.
 *
 * Why separate from DatabaseModule:
 *   The NestJS app uses TypeOrmModule.forRootAsync (DI-wired, async config).
 *   The TypeORM CLI needs a plain synchronous DataSource export.
 *   Both read the same .env variables, so they stay in sync.
 *
 * Path resolution:
 *   This file compiles to dist/ormconfig.js (the value of ORM_CONFIG in migration.sh).
 *   At runtime __dirname === dist/, so the globs below resolve correctly:
 *     entities   → dist/**\/*.entity.js
 *     migrations → dist/migrations\/*.js
 *
 * migration.sh runs `npm run build` before every CLI command, so dist/ is always fresh.
 */
export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  username: process.env.DB_USERNAME ?? 'postgres',
  password: process.env.DB_PASSWORD ?? 'postgres',
  database: process.env.DB_NAME ?? 'kairo',
  synchronize: false,

  // Wraps each migration file in its own transaction — matches --transaction each in migration.sh.
  // If one migration fails, only that migration rolls back; previously applied ones are kept.
  migrationsTransactionMode: 'each',

  // Underscore prefix visually separates this system table from business tables
  migrationsTableName: '_migrations',

  // Auto-maps camelCase property names to snake_case column names.
  // e.g. passwordHash → password_hash, createdAt → created_at
  // Must match DatabaseModule so CLI and runtime see the same schema.
  namingStrategy: new SnakeNamingStrategy(),

  // Glob picks up all compiled entity files across all modules
  entities: [join(__dirname, '**', '*.entity.js')],

  // Points at the compiled output of src/migrations/ (MIGRATION_DIR in migration.sh)
  migrations: [join(__dirname, 'migrations', '*.js')],
});
