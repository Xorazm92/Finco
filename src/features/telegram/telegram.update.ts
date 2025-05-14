import { Update, Start, Help, Ctx, Message, Command, On } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Update()
export class TelegramUpdate {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  @Start()
  async onStart(@Ctx() ctx: Context) {
    await ctx.reply('FinCo KPI botiga xush kelibsiz! /help buyrug\'i bilan yordam olishingiz mumkin.');
  }

  @Help()
  async onHelp(@Ctx() ctx: Context) {
    await ctx.reply('Bot yordamchisi: \n/start - Botni boshlash\n/help - Yordam\nSavollar uchun xabar yuboring.');
  }

  @On('message')
  async onMessage(@Message() message: any, @Ctx() ctx: Context) {
    if (message.text) {
      this.eventEmitter.emit('telegram.message.received', { telegramMessage: message, ctx });
    }
  }
}
