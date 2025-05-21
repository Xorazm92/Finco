import { Module } from '@nestjs/common';
import { MessageLogTimeoutModule } from './message-log-timeout.module';
import { MessageLogTimeoutCron } from './message-log.timeout.cron';

@Module({
  imports: [MessageLogTimeoutModule],
  providers: [MessageLogTimeoutCron],
})
export class MessageLogTimeoutCronModule {}
