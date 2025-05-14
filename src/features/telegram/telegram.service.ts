import { Injectable } from '@nestjs/common';
import { InjectBot } from 'nestjs-telegraf';
import { Telegraf } from 'telegraf';

@Injectable()
export class TelegramService {
  constructor(@InjectBot() private readonly bot: Telegraf) {}

  async sendMessage(chatId: number | string, text: string, options?: any) {
    return this.bot.telegram.sendMessage(chatId, text, options);
  }

  async sendDocument(chatId: number | string, file: any, options?: any) {
    return this.bot.telegram.sendDocument(chatId, file, options);
  }

  // Add more Telegram API wrappers as needed
}
