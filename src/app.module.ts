import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';

import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './modules/users/users.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    // ConfigModule is global — no need to import it in feature modules.
    // Loads .env automatically; namespaced configs keep values typed and scoped.
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [appConfig, databaseConfig],
      cache: true, // Speeds up repeated reads in hot paths
    }),

    DatabaseModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,

    // Global exception filter — normalises all error responses in one place
    { provide: APP_FILTER, useClass: AllExceptionsFilter },

    // Global response interceptor — wraps every success in { success, data, timestamp }
    { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
  ],
})
export class AppModule {}
