import { Update, Ctx, On, Start, Hears } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { ResponseTimeTrackingService } from './response-time-tracking.service';

@Update()
export class ResponseTimeTrackingUpdate {
  constructor(
    private readonly responseTimeService: ResponseTimeTrackingService,
  ) {}

  // Foydalanuvchi savol yuborganida (oddiy text message)
  @On('text')
  async onText(@Ctx() ctx: Context) {
    // Agar reply_to_message yo'q bo'lsa, bu savol deb hisoblaymiz
    if (!(ctx.message as any)?.reply_to_message) {
      this.responseTimeService.onQuestion(ctx);
    } else {
      // Aks holda, bu javob deb hisoblaymiz
      const responseTime = this.responseTimeService.onAnswer(ctx);
      if (responseTime !== null) {
        await ctx.reply(`Javob vaqti: ${responseTime} soniya`);
      }
    }
  }
}
