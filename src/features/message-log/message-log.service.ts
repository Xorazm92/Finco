import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MessageLogEntity } from './entities/message-log.entity';

@Injectable()
export class MessageLogService {
  constructor(
    @InjectRepository(MessageLogEntity)
    private readonly messageLogRepo: Repository<MessageLogEntity>,
  ) {}

  async logMessage(data: Partial<MessageLogEntity>): Promise<MessageLogEntity> {
    // Savolni aniqlash: CLIENT va matnda ? yoki savol kalit so'zlari
    let isQuestion = false;
    let questionStatus: 'PENDING' | 'ANSWERED' | 'TIMEOUT' = 'PENDING';
    let answeredByMessageId: number | null = null;
    let responseTimeSeconds: number | null = null;
    let answerDetectionMethod: string | null = null;

    if (data.senderRoleAtMoment === 'CLIENT' && data.textContent) {
      const txt = data.textContent.trim();
      // Oddiy savol belgisi yoki kalit so'zlar
      if (txt.endsWith('?') || /savol|question|\?$|\bkim\b|\bqachon\b|\bnega\b/i.test(txt)) {
        isQuestion = true;
      }
    }

    // Agar bu reply bo'lsa va reply qilingan xabar savol bo'lsa, javob matching
    if (data.isReplyToMessageId) {
      // Bazadan reply qilingan xabarni topamiz
      const repliedMsg = await this.messageLogRepo.findOne({
        where: { telegramMessageId: data.isReplyToMessageId, telegramChatId: data.telegramChatId },
      });
      if (repliedMsg && repliedMsg.isQuestion) {
        // Savolga javob berildi
        questionStatus = 'ANSWERED';
        answeredByMessageId = data.telegramMessageId!;
        responseTimeSeconds = Math.floor((+new Date(data.sentAt!) - +new Date(repliedMsg.sentAt)) / 1000);
        answerDetectionMethod = 'reply';
        // Savol xabarini yangilaymiz
        repliedMsg.questionStatus = 'ANSWERED';
        repliedMsg.answeredByMessageId = answeredByMessageId;
        repliedMsg.responseTimeSeconds = responseTimeSeconds;
        repliedMsg.answerDetectionMethod = answerDetectionMethod;
        await this.messageLogRepo.save(repliedMsg);
      }
    }

    // Yangi xabarni loglaymiz
    const message = new MessageLogEntity();
    message.telegramMessageId = data.telegramMessageId!;
    message.telegramChatId = data.telegramChatId!;
    message.senderTelegramId = data.senderTelegramId!;
    message.senderRoleAtMoment = data.senderRoleAtMoment!;
    message.sentAt = data.sentAt!;
    message.textContent = data.textContent ?? null;
    message.isReplyToMessageId = data.isReplyToMessageId ?? null;
    message.hasAttachments = data.hasAttachments ?? false;
    message.attachmentType = data.attachmentType ?? null;
    message.isQuestion = typeof data.isQuestion === 'boolean' ? data.isQuestion : isQuestion;
    message.questionStatus = data.questionStatus ?? questionStatus;
    message.answeredByMessageId = data.answeredByMessageId ?? answeredByMessageId;
    message.responseTimeSeconds = data.responseTimeSeconds ?? responseTimeSeconds;
    message.answerDetectionMethod = data.answerDetectionMethod ?? answerDetectionMethod ?? null;

    return await this.messageLogRepo.save(message);
  }

  async findByChatId(chatId: number, limit = 50): Promise<MessageLogEntity[]> {
    return this.messageLogRepo.find({
      where: { telegramChatId: chatId },
      order: { sentAt: 'DESC' },
      take: limit,
    });
  }
}
