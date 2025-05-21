import { Module } from '@nestjs/common';
import { MessageLoggingService } from './message-logging.service';

@Module({
  providers: [MessageLoggingService],
})
export class MessageLoggingModule {}
