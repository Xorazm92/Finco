
import { Injectable } from '@nestjs/common';
import { Context } from 'telegraf';
import { ClientProxy } from '@nestjs/microservices';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class TelegramGatewayService {
  constructor(
    @InjectQueue('message-processing') private messageQueue: Queue,
  ) {}

  async handleUpdate(ctx: Context) {
    if ('message' in ctx.update) {
      await this.messageQueue.add('process-message', {
        message: ctx.update.message,
        chat: ctx.chat,
        from: ctx.from,
      });
    }
  }

  async sendMessage(chatId: string, text: string) {
    // Message sending logic
    return this.messageQueue.add('send-message', {
      chatId,
      text
    });
  }
}
