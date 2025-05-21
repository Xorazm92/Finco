import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigModule } from '@nestjs/config';
import { SttService } from './stt.service';
import { SttProcessor } from './stt.processor';
import { MessageLogModule } from '../message-log/message-log.module';
import { AiQueueService } from './ai-queue.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'stt_queue',
    }),
    ConfigModule,
    MessageLogModule,
  ],
  providers: [
    SttService,
    SttProcessor,
    AiQueueService,
  ],
  exports: [
    SttService,
  ],
})
export class SttModule {}
