import { Injectable, Logger } from '@nestjs/common';
import { Context, Telegraf } from 'telegraf';

@Injectable()
export class ResponseTimeTrackingService {
  private readonly logger = new Logger(ResponseTimeTrackingService.name);
  private questionTimestamps: Map<number, number> = new Map();

  // Called when a question is sent in the group
  onQuestion(ctx: Context) {
    const messageId = ctx.message?.message_id;
    if (messageId) {
      this.questionTimestamps.set(messageId, Date.now());
      this.logger.log(`Question logged: messageId=${messageId}`);
    }
  }

  // Called when an answer is sent in the group
  onAnswer(ctx: Context) {
    const replyTo = (ctx.message as any)?.reply_to_message?.message_id;
    if (replyTo && this.questionTimestamps.has(replyTo)) {
      const questionTime = this.questionTimestamps.get(replyTo)!;
      const answerTime = Date.now();
      const responseTimeSec = Math.round((answerTime - questionTime) / 1000);
      this.logger.log(
        `Answer received for messageId=${replyTo}, responseTime=${responseTimeSec}s`,
      );
      // TODO: Send this info to backend API
      this.questionTimestamps.delete(replyTo);
      return responseTimeSec;
    }
    return null;
  }
}
