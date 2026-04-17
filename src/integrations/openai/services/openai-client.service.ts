import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class OpenAiClientService {
  constructor(private readonly configService: ConfigService) {}

  isConfigured(): boolean {
    return Boolean(this.configService.get<string>('openai.apiKey'));
  }

  getModel(): string {
    return this.configService.get<string>('openai.model') ?? 'gpt-5-mini';
  }

  getReasoningEffort(): string {
    return this.configService.get<string>('openai.reasoningEffort') ?? 'low';
  }

  createClient(): OpenAI {
    return new OpenAI({
      apiKey: this.configService.get<string>('openai.apiKey'),
    });
  }
}
