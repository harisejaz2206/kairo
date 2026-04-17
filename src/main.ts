import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, {
    // Disable verbose logging in production
    logger:
      process.env.NODE_ENV === 'production'
        ? ['error', 'warn']
        : ['log', 'debug', 'error', 'warn'],
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('app.port', 3000);
  const host = configService.get<string>('app.host', 'localhost');
  const corsOrigins = configService.get<string[]>('app.corsOrigins', []);
  const enableSwagger = configService.get<boolean>('app.enableSwagger', true);
  const swaggerPath = configService.get<string>('app.swaggerPath', 'docs');
  const apiPrefix = 'api';

  // All routes are prefixed with /api
  app.setGlobalPrefix(apiPrefix);

  // CORS — origins are driven by environment config, never hardcoded
  app.enableCors({
    origin: corsOrigins.length ? corsOrigins : false,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  // Global validation pipe:
  //   whitelist      — strips properties not declared in the DTO
  //   forbidNonWhitelisted — throws 400 if unknown properties arrive
  //   transform      — auto-coerces payloads to DTO class instances
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  if (enableSwagger) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Kairo API')
      .setDescription('API documentation for the Kairo backend.')
      .setVersion('1.0')
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup(swaggerPath, app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
    });
  }

  await app.listen(port);

  const appUrl = `http://${host}:${port}`;
  const apiUrl = `${appUrl}/${apiPrefix}`;

  logger.log(`Application running on: ${appUrl}`);
  logger.log(`API base URL: ${apiUrl}`);

  if (enableSwagger) {
    logger.log(`Swagger docs available at: ${appUrl}/${swaggerPath}`);
  } else {
    logger.log('Swagger docs are disabled.');
  }
}

bootstrap();
