import { Injectable } from '@nestjs/common';
import { InjectBot } from 'nestjs-telegraf';
import { Telegraf } from 'telegraf';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TelegramService {
  constructor(
    @InjectBot() private readonly bot: Telegraf,
    private readonly configService: ConfigService,
  ) {}

  async sendMessage(chatId: number | string, text: string, options?: any) {
    return this.bot.telegram.sendMessage(chatId, text, options);
  }

  async sendDocument(chatId: number | string, file: any, options?: any) {
    return this.bot.telegram.sendDocument(chatId, file, options);
  }

  async sendMessageToAdmin(text: string) {
    const adminChatId = this.configService.get<string>('TELEGRAM_ADMIN_CHAT_ID');
    if (!adminChatId) return;
    await this.bot.telegram.sendMessage(adminChatId, text);
  }

  // Add more Telegram API wrappers as needed
}
