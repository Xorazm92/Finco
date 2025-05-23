import { Module } from '@nestjs/common';
import { LlmClientService } from './llm-client.service';
import { PromptEngineeringService } from './prompt-engineering.service';
import { LlmResponseParserService } from './llm-response-parser.service';
import { AiTaskCoordinatorService } from './ai-task-coordinator.service';
import { AiAnalysisService } from './ai-analysis.service';

import { TypeOrmModule } from '@nestjs/typeorm';
import { AiAnalysisResultEntity } from './entities/ai-analysis-result.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AiAnalysisResultEntity])],
  providers: [
    LlmClientService,
    PromptEngineeringService,
    LlmResponseParserService,
    AiTaskCoordinatorService,
    AiAnalysisService,
  ],
  exports: [
    TypeOrmModule,
    LlmClientService,
    PromptEngineeringService,
    LlmResponseParserService,
    AiTaskCoordinatorService,
    AiAnalysisService,
  ],
})
export class AiAnalysisModule {}
