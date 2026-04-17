import { Module } from '@nestjs/common';
import { OpenAiClientService } from './services/openai-client.service.js';

@Module({
  providers: [OpenAiClientService],
  exports: [OpenAiClientService],
})
export class OpenAiModule {}
