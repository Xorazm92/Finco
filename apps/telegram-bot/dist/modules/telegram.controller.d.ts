import { TelegramService } from './telegram.service';
import { UserService } from '../user-management/user.service';
import { MessageLogService } from '../message-log/message-log.service';
import { AiQueueService } from '../artificial-intelligence/ai-queue.service';
import { Context } from 'telegraf';
export declare class TelegramController {
  private readonly telegramService;
  private readonly userService;
  private readonly messageLogService;
  private readonly aiQueueService;
  private readonly queue?;
  private readonly logger;
  constructor(
    telegramService: TelegramService,
    userService: UserService,
    messageLogService: MessageLogService,
    aiQueueService: AiQueueService,
    queue?: any,
  );
  handleUpdate(update: any): Promise<
    | {
        ok: boolean;
        error: string;
      }
    | {
        ok: boolean;
        error?: undefined;
      }
  >;
  getStats(): {
    users: number;
    messages: number;
    status: string;
    time: string;
  };
  onMessage(ctx: Context): Promise<void>;
}
