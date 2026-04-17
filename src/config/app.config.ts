import { registerAs } from '@nestjs/config';

// Namespaced config factory — injected via ConfigService.get('app.*')
export default registerAs('app', () => ({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.PORT ?? '3000', 10),
  host: process.env.HOST ?? 'localhost',
  corsOrigins: (process.env.CORS_ORIGINS ?? '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean),
  enableSwagger: process.env.ENABLE_SWAGGER !== 'false',
  swaggerPath: process.env.SWAGGER_PATH ?? 'docs',
}));
