import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MessageLogEntity, MessageStatus } from './entities/message-log.entity';
import { UserEntity } from '../user-management/entities/user.entity';
import { UserRole } from '../../shared/enums/user-role.enum';

@Injectable()
export class ResponseTimeService {
  constructor(
    @InjectRepository(MessageLogEntity)
    private readonly messageLogRepo: Repository<MessageLogEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
  ) {}

  // Kalit so'zlarni ajratish
  private extractKeywords(text: string): string[] {
    if (!text) return [];
    const keywords = text.toLowerCase().match(/\b(\w{3,})\b/g);
    return keywords ? Array.from(new Set(keywords)) : [];
  }

  private isLikelyQuestion(text: string): boolean {
    if (!text) return false;
    const questionWords = [
      'mi',
      'qachon',
      'qanday',
      'nima uchun',
      'kerak',
      'mumkinmi',
      '?',
    ];
    return (
      questionWords.some((w) => text.toLowerCase().includes(w)) ||
      /[?]/.test(text)
    );
  }

  async processMessage(message: any, ctx: any) {
    // Userni bazaga qo‘shish yoki olish (chatId bo'yicha)
    let user = await this.userRepo.findOne({
      where: {
        telegramId: String(message.from.id),
        chatId: String(message.chat.id),
      },
    });
    if (!user) {
      user = this.userRepo.create({
        telegramId: String(message.from.id),
        chatId: String(message.chat.id),
        firstName: message.from.first_name,
        lastName: message.from.last_name ?? undefined,
        username: message.from.username ?? undefined,
        role: UserRole.CLIENT,
        isActive: true,
      } as Partial<UserEntity>);
      await this.userRepo.save(user);
    }
    // Savol aniqlash
    const isClientQuestion =
      user.role === UserRole.CLIENT && this.isLikelyQuestion(message.text);
    const questionKeywords = this.extractKeywords(message.text);
    // MessageLogEntity yaratish
    const log = this.messageLogRepo.create({
      telegramMessageId: String(message.message_id),
      telegramChatId: String(message.chat.id),
      senderUser: user,
      senderRoleAtMoment: user.role,
      sentAt: new Date(message.date * 1000),
      textPreview: message.text?.slice(0, 255),
      isClientQuestion,
      status: isClientQuestion ? MessageStatus.PENDING_ANSWER : undefined,
      questionKeywords: isClientQuestion ? questionKeywords : undefined,
      repliedToMessageId: message.reply_to_message?.message_id
        ? String(message.reply_to_message.message_id)
        : undefined,
    });
    await this.messageLogRepo.save(log);

    // Reply orqali javob aniqlash
    if (
      message.reply_to_message &&
      [UserRole.ACCOUNTANT, UserRole.BANK_CLIENT, UserRole.SUPERVISOR].includes(
        user.role,
      )
    ) {
      const original = await this.messageLogRepo.findOne({
        where: {
          telegramMessageId: String(message.reply_to_message.message_id),
          telegramChatId: String(message.chat.id),
          isClientQuestion: true,
          status: MessageStatus.PENDING_ANSWER,
        },
      });
      if (original) {
        const responseTime =
          (log.sentAt.getTime() - original.sentAt.getTime()) / 1000;
        original.replyByUser = user;
        original.replyByRoleAtMoment = user.role;
        original.repliedAt = log.sentAt;
        original.responseTimeSeconds = Math.round(responseTime);
        original.replyMessageId = log.telegramMessageId;
        original.replyDetectionMethod = 'REPLY';
        original.status = MessageStatus.ANSWERED;
        original.confidenceScore = 1.0;
        await this.messageLogRepo.save(original);
      }
      return;
    }

    // Reply-siz (vaqt oynasi + keyword) javob aniqlash
    if (
      [UserRole.ACCOUNTANT, UserRole.BANK_CLIENT, UserRole.SUPERVISOR].includes(
        user.role,
      )
    ) {
      const T_window = 10 * 60 * 1000; // 10 daqiqa
      const now = log.sentAt.getTime();
      const pendingQuestions = await this.messageLogRepo.find({
        where: {
          telegramChatId: String(message.chat.id),
          isClientQuestion: true,
          status: MessageStatus.PENDING_ANSWER,
        },
      });
      const candidates = pendingQuestions.filter(
        (q) => now > q.sentAt.getTime() && now - q.sentAt.getTime() <= T_window,
      );
      if (candidates.length === 1) {
        // Faqat bitta savol - avtomatik bog'lash
        const q = candidates[0];
        const responseTime = (log.sentAt.getTime() - q.sentAt.getTime()) / 1000;
        q.replyByUser = user;
        q.replyByRoleAtMoment = user.role;
        q.repliedAt = log.sentAt;
        q.responseTimeSeconds = Math.round(responseTime);
        q.replyMessageId = log.telegramMessageId;
        q.replyDetectionMethod = 'TIME_WINDOW_SINGLE_PENDING';
        q.status = MessageStatus.ANSWERED;
        q.confidenceScore = 0.8;
        await this.messageLogRepo.save(q);
        return;
      } else if (candidates.length > 1) {
        // Bir nechta savol - keyword match orqali
        let bestMatch: MessageLogEntity | null = null;
        let bestScore = 0;
        for (const q of candidates) {
          const overlap =
            q.questionKeywords?.filter((kw) => questionKeywords.includes(kw))
              .length || 0;
          if (overlap > bestScore) {
            bestScore = overlap;
            bestMatch = q;
          }
        }
        const keywordMatchThreshold = 2; // configdan olinishi mumkin
        if (bestMatch && bestScore >= keywordMatchThreshold) {
          const responseTime =
            (log.sentAt.getTime() - bestMatch.sentAt.getTime()) / 1000;
          bestMatch.replyByUser = user;
          bestMatch.replyByRoleAtMoment = user.role;
          bestMatch.repliedAt = log.sentAt;
          bestMatch.responseTimeSeconds = Math.round(responseTime);
          bestMatch.replyMessageId = log.telegramMessageId;
          bestMatch.replyDetectionMethod =
            'TIME_WINDOW_MULTIPLE_PENDING_KEYWORD_MATCH';
          bestMatch.status = MessageStatus.ANSWERED;
          bestMatch.confidenceScore = 0.6;
          await this.messageLogRepo.save(bestMatch);
          return;
        }
        // SUPERVISORga signal: noaniq bog'lanish
        // TODO: Supervisor notification (future)
      }
    }
  }
}
