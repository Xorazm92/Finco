import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MessageLogTimeoutService } from './message-log.timeout';

@Injectable()
export class MessageLogTimeoutCron {
  constructor(private readonly timeoutService: MessageLogTimeoutService) {}

  // Har 5 daqiqada savollarga timeout belgilash
  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleTimeoutQuestions() {
    const count = await this.timeoutService.markTimeoutQuestions(600); // 10 minut
    if (count > 0) {
      // Logging yoki monitoring uchun
      console.log(`[TimeoutCron] ${count} ta savolga timeout belgilandi.`);
    }
  }
}
