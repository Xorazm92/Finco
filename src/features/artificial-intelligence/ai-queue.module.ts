import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { AiAnalysisModule } from './ai-analysis.module';
import { AiQueueProcessor } from './ai-queue.processor';
import { AiQueueService } from './ai-queue.service';
import { AiQueueController } from './ai-queue.controller';
import { AiAnalysisResultModule } from './ai-analysis-result.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'ai-tasks',
    }),
    AiAnalysisModule,
    AiAnalysisResultModule,
  ],
  providers: [AiQueueProcessor, AiQueueService],
  controllers: [AiQueueController],
  exports: [BullModule, AiQueueService],
})
export class AiQueueModule {}
