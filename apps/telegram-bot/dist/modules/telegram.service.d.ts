import { Telegraf } from 'telegraf';
export declare class TelegramService {
  private readonly bot;
  constructor(bot: Telegraf);
  sendMessage(
    chatId: number | string,
    text: string,
    options?: any,
  ): Promise<import('@telegraf/types').Message.TextMessage>;
  sendDocument(
    chatId: number | string,
    file: any,
    options?: any,
  ): Promise<import('@telegraf/types').Message.DocumentMessage>;
}
