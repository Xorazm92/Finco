import { Module } from '@nestjs/common';
import { AiAnalysisModule } from './ai-analysis.module';
import { AiTestController } from './ai-test.controller';
import { AiQueueModule } from './ai-queue.module';
import { HumanFeedbackModule } from './human-feedback.module';

@Module({
  imports: [AiAnalysisModule, AiQueueModule, HumanFeedbackModule],
  controllers: [AiTestController],
})
export class AiModule {}
