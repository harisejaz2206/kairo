import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

/**
 * DatabaseModule wires TypeORM to the namespaced 'database.*' config values.
 *
 * Key decisions:
 *  - synchronize is ALWAYS false — schema changes are handled by migrations only.
 *    Enabling synchronize in production can silently drop columns or tables.
 *  - autoLoadEntities: true — entities registered via TypeOrmModule.forFeature()
 *    in feature modules are picked up automatically without manual listing here.
 *  - retryAttempts / retryDelay — allows the app to wait for the DB on startup
 *    in Docker environments where the DB container may start after the app.
 */
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('database.host'),
        port: configService.get<number>('database.port'),
        username: configService.get<string>('database.username'),
        password: configService.get<string>('database.password'),
        database: configService.get<string>('database.name'),

        synchronize: false,
        migrationsTableName: '_migrations',

        // Must match ormconfig.ts — both must agree on naming or columns won't align
        namingStrategy: new SnakeNamingStrategy(),

        // Entities are registered per-module via TypeOrmModule.forFeature()
        autoLoadEntities: true,

        // Retry logic for containerised environments (e.g. Docker Compose)
        retryAttempts: 5,
        retryDelay: 3000,

        // Log only errors and slow queries in production
        logging:
          configService.get<string>('app.nodeEnv') !== 'production'
            ? ['query', 'error']
            : ['error'],
      }),
    }),
  ],
})
export class DatabaseModule {}
