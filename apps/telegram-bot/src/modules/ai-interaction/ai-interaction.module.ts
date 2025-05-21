import { Module } from '@nestjs/common';
import { AiInteractionService } from './ai-interaction.service';
import { AiQueueService } from './ai-queue.service';

@Module({
  providers: [AiInteractionService, AiQueueService],
})
export class AiInteractionModule {}
