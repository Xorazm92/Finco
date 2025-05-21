import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { IncomingMessageProcessor } from './incoming-message.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'incoming_messages_queue',
      redis: { host: 'localhost', port: 6379 }, // yoki .env orqali sozlang
    }),
  ],
  providers: [IncomingMessageProcessor],
})
export class QueueModule {}
