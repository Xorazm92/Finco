import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MessageLog } from './message-log.entity';
import { UserService } from '../user/user.service';
import { Context } from 'telegraf';

@Injectable()
export class MessageLoggingService {
  constructor(
    @InjectRepository(MessageLog) private messageLogRepo: Repository<MessageLog>,
    private userService: UserService,
  ) {}

  async logMessage(ctx: Context): Promise<MessageLog | undefined> {
    const msg = ctx.message as any;
    if (!msg || !msg.from || !msg.chat) return undefined;
    const senderRole = await this.userService.getUserRoleInChat(msg.from.id, msg.chat.id);
    const log = this.messageLogRepo.create({
      telegramMessageId: msg.message_id,
      telegramChatId: String(msg.chat.id),
      senderTelegramId: String(msg.from.id),
      senderRoleAtMoment: senderRole,
      sentAt: new Date(msg.date * 1000),
      textContent: typeof msg.text === 'string' ? msg.text : undefined,
      isReplyToMessageId: msg.reply_to_message?.message_id,
    });
    await this.messageLogRepo.save(log);
    return log;
  }

  // KPI: O'rtacha javob vaqti (sekundlarda)
  async getAverageResponseTime(chatId: string): Promise<number | null> {
    const result = await this.messageLogRepo
      .createQueryBuilder('log')
      .select('AVG(log.responseTimeSeconds)', 'avg')
      .where('log.telegramChatId = :chatId', { chatId })
      .andWhere('log.isQuestion = true')
      .andWhere('log.questionStatus = :status', { status: 'ANSWERED' })
      .getRawOne();
    return result?.avg ? parseFloat(result.avg) : null;
  }

  // KPI: Javobsiz savollar soni
  async getUnansweredQuestionsCount(chatId: string): Promise<number> {
    return this.messageLogRepo.count({
      where: {
        telegramChatId: chatId,
        isQuestion: true,
        questionStatus: 'PENDING',
      },
    });
  }

  // KPI: Operatorlar bo‘yicha javob statistikasi
  async getOperatorResponseStats(chatId: string) {
    return this.messageLogRepo
      .createQueryBuilder('log')
      .select('log.answeredByMessageId', 'answerId')
      .addSelect('log.responseTimeSeconds', 'responseTime')
      .addSelect('answer.senderTelegramId', 'operatorId')
      .leftJoin(MessageLog, 'answer', 'answer.telegramMessageId = log.answeredByMessageId')
      .where('log.telegramChatId = :chatId', { chatId })
      .andWhere('log.isQuestion = true')
      .andWhere('log.questionStatus = :status', { status: 'ANSWERED' })
      .getRawMany();
  }
}
