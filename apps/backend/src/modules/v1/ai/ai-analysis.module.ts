import { Module } from '@nestjs/common';
import { LlmClientService } from './llm-client.service';
import { PromptEngineeringService } from './prompt-engineering.service';
import { LlmResponseParserService } from './llm-response-parser.service';
import { AiTaskCoordinatorService } from './ai-task-coordinator.service';

@Module({
  providers: [
    LlmClientService,
    PromptEngineeringService,
    LlmResponseParserService,
    AiTaskCoordinatorService,
  ],
  exports: [
    LlmClientService,
    PromptEngineeringService,
    LlmResponseParserService,
    AiTaskCoordinatorService,
  ],
})
export class AiAnalysisModule {}
