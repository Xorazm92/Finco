import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class LlmResponseParserService {
  private readonly logger = new Logger(LlmResponseParserService.name);

  parseJson<T = any>(response: string): T | null {
    try {
      return JSON.parse(response) as T;
    } catch (err) {
      this.logger.warn('LLM response is not valid JSON', err);
      return null;
    }
  }

  // fallback: extract structured info from plain text (future extension)
  extractFromText(response: string): any {
    // TODO: implement custom extraction if needed
    return { raw: response };
  }
}
