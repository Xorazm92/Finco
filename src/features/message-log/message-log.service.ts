import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MessageLogEntity } from './entities/message-log.entity';

@Injectable()
export class MessageLogService {
  constructor(
    @InjectRepository(MessageLogEntity)
    private readonly messageLogRepo: Repository<MessageLogEntity>,
  ) { }

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

    // SI asosidagi matching: reply bo'lmagan javoblar uchun
    if (!data.isReplyToMessageId && ['ACCOUNTANT', 'BANK_CLIENT', 'BANK_CLIENT_SPECIALIST'].includes(data.senderRoleAtMoment || '')) {
      // Oxirgi 10 ta javobsiz CLIENT savolini topamiz
      const recentQuestions = await this.messageLogRepo.find({
        where: {
          telegramChatId: data.telegramChatId,
          isQuestion: true,
          questionStatus: 'PENDING',
        },
        order: { sentAt: 'DESC' },
        take: 10,
      });
      if (recentQuestions.length && data.textContent) {
        // Eng yaxshi mos keladigan savolni topish (oddiy keyword overlap bilan)
        const answerKeywords = (data.textContent || '').toLowerCase().split(/\W+/).filter(Boolean);
        let bestMatch: MessageLogEntity | null = null;
        let bestScore = 0;
        for (const q of recentQuestions) {
          const qKeywords = (q.textContent || '').toLowerCase().split(/\W+/).filter(Boolean);
          const overlap = qKeywords.filter(k => answerKeywords.includes(k)).length;
          if (overlap > bestScore) {
            bestScore = overlap;
            bestMatch = q;
          }
        }
        // Agar overlap > 0 bo'lsa, matching deb hisoblaymiz
        if (bestMatch && bestScore > 0) {
          const responseTimeSeconds = Math.floor((+new Date(data.sentAt!) - +new Date(bestMatch.sentAt)) / 1000);
          bestMatch.questionStatus = 'ANSWERED';
          bestMatch.answeredByMessageId = data.telegramMessageId!;
          bestMatch.responseTimeSeconds = responseTimeSeconds;
          bestMatch.answerDetectionMethod = 'semantic';
          await this.messageLogRepo.save(bestMatch);
          questionStatus = 'ANSWERED';
          answeredByMessageId = data.telegramMessageId!;
          answerDetectionMethod = 'semantic';
          responseTimeSeconds;
        }
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

  async updateMessageLogTranscription(messageLogId: number | string, transcribedText: string): Promise<MessageLogEntity> {
    const message = await this.messageLogRepo.findOne({ where: { id: Number(messageLogId) } });
    if (!message) {
      throw new Error(`MessageLog with ID ${messageLogId} not found.`);
    }
    // Update transcribedText (audio transcription)
    message.transcribed_text = transcribedText;
    // If message is VOICE type, also update textContent for searchability
    if (message.attachmentType === 'VOICE' || message.attachmentType === 'AUDIO') {
      message.textContent = transcribedText;
    }
    return this.messageLogRepo.save(message);
  }
}