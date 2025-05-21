import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { aiConfig } from './ai.config';

@Injectable()
export class LlmClientService {
  private readonly logger = new Logger(LlmClientService.name);
  private readonly client: AxiosInstance;
  constructor() {
    this.client = axios.create({
      baseURL: aiConfig.ollamaUrl,
      timeout: 15000,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  async generate(
    prompt: string,
    model?: string,
    params?: Record<string, any>,
  ): Promise<string> {
    const reqModel = model || aiConfig.defaultModel;
    const reqParams = { ...aiConfig.defaultParams, ...params };
    try {
      const res = await this.client.post('/api/generate', {
        model: reqModel,
        prompt,
        ...reqParams,
      });
      if (res.data && res.data.response) {
        return res.data.response;
      }
      throw new Error('No response from LLM');
    } catch (err: any) {
      this.logger.error('LLM request failed', err);
      throw err;
    }
  }
}
