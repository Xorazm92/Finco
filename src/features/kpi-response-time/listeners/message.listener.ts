import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ResponseTimeService } from '../response-time.service';

@Injectable()
export class MessageListener {
  constructor(private readonly responseTimeService: ResponseTimeService) {}

  @OnEvent('telegram.message.received')
  async handleMessage(payload: any) {
    await this.responseTimeService.processMessage(payload.telegramMessage, payload.ctx);
  }
}
