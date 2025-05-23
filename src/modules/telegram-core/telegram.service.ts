import { Injectable } from '@nestjs/common';
import { Context } from 'telegraf';
import { ConfigService } from '@nestjs/config';
import { Telegraf } from 'telegraf';

@Injectable()
export class TelegramService {
  constructor(private configService: ConfigService) {}

  async sendMessage(ctx: Context, text: string) {
    await ctx.reply(text);
  }

  async sendMessageToAdmin(text: string) {
    const adminChatId = this.configService.get<string>('TELEGRAM_ADMIN_CHAT_ID');
    const botToken = this.configService.get<string>('TELEGRAM_BOT_TOKEN');
    if (!adminChatId || !botToken) return;
    const bot = new Telegraf(botToken);
    await bot.telegram.sendMessage(adminChatId, text);
  }
}
