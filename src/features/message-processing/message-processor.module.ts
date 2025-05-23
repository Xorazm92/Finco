
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { MessageProcessorService } from './message-processor.service';
import { MessageProcessorConsumer } from './message-processor.consumer';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'message-processing',
    }),
  ],
  providers: [MessageProcessorService, MessageProcessorConsumer],
})
export class MessageProcessorModule {}
