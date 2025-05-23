import { Injectable, Logger } from '@nestjs/common';
import { LlmClientService } from './llm-client.service';
import { PromptEngineeringService } from './prompt-engineering.service';
import { LlmResponseParserService } from './llm-response-parser.service';

@Injectable()
export class AiTaskCoordinatorService {
  private readonly logger = new Logger(AiTaskCoordinatorService.name);
  constructor(
    private readonly llmClient: LlmClientService,
    private readonly promptManager: PromptEngineeringService,
    private readonly responseParser: LlmResponseParserService,
  ) {}

  /**
   * Example: Sentiment analysis task
   */
  async analyzeSentiment(text: string): Promise<any> {
    const prompt = this.promptManager.getPrompt('sentiment', { text });
    const response = await this.llmClient.generate(prompt);
    return this.responseParser.parseJson(response) || this.responseParser.extractFromText(response);
  }

  async analyzeQuestion(text: string): Promise<any> {
    const prompt = this.promptManager.getPrompt('question_analysis', { text });
    const response = await this.llmClient.generate(prompt);
    return this.responseParser.parseJson(response) || this.responseParser.extractFromText(response);
  }

  async analyzeReply(question: string, answer: string): Promise<any> {
    const prompt = this.promptManager.getPrompt('reply_analysis', { question, answer });
    const response = await this.llmClient.generate(prompt);
    return this.responseParser.parseJson(response) || this.responseParser.extractFromText(response);
  }
}
