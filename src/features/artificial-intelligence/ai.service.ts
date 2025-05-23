
import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { LlmClientService } from './llm-client.service';
import { PromptEngineeringService } from './prompt-engineering.service';

@Injectable()
export class AiService {
  constructor(
    @Inject('AI_SERVICE') private readonly aiClient: ClientProxy,
    private readonly llmClient: LlmClientService,
    private readonly promptService: PromptEngineeringService,
  ) {}

  async analyzeMessage(message: string) {
    return this.aiClient.send({ cmd: 'analyze_message' }, { message }).toPromise();
  }

  async generateResponse(context: any) {
    return this.aiClient.send({ cmd: 'generate_response' }, context).toPromise();
  }
}
