import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MessageLogEntity } from '../message-log/entities/message-log.entity';
import { UserEntity } from '../user-management/entities/user.entity';
import { UserRole } from '../../shared/enums/user-role.enum';
import { KPI_CONFIG } from '../../config/kpi.config';
import { UserService } from '../user-management/user.service';
import { Logger } from '@nestjs/common';

@Injectable()
export class ResponseTimeService {
  private readonly logger = new Logger(ResponseTimeService.name);
  constructor(
    @InjectRepository(MessageLogEntity)
    private readonly messageLogRepo: Repository<MessageLogEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    private readonly userService: UserService,
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
    try {
      this.logger.log('processMessage called', message);
      // Userni bazaga qo‘shish yoki olish (chatId bo'yicha)
      this.logger.debug('Looking up user in DB', { telegramId: message.from?.id, chatId: message.chat?.id });
      let user = await this.userRepo.findOne({
        where: {
          telegramId: String(message.from.id),
        },
      });
      if (!user) {
        user = this.userRepo.create({
          telegramId: String(message.from.id),
          firstName: message.from.first_name,
          lastName: message.from.last_name ?? undefined,
          username: message.from.username ?? undefined,
          isActive: true,
        } as Partial<UserEntity>);
        await this.userRepo.save(user);
      }
      // Savol aniqlash
      const userRoleInChat = await this.userService.getUserRole(
        String(message.from.id),
        String(message.chat.id)
      );
      const isClientQuestion =
        userRoleInChat === UserRole.CLIENT && this.isLikelyQuestion(message.text);
      const questionKeywords = this.extractKeywords(message.text);
      // MessageLogEntity yaratish
      const log = this.messageLogRepo.create({
        telegramMessageId: message.message_id,
        telegramChatId: message.chat.id,
        // telegramUserId: message.from.id,
        // telegramUserName: message.from.username,
        sentAt: new Date(message.date * 1000),
        // text: message.text,
        isReplyToMessageId: message.reply_to_message?.message_id ?? null,
      });
      await this.messageLogRepo.save(log);

      // Reply orqali javob aniqlash
      if (
        message.reply_to_message &&
        [UserRole.ACCOUNTANT, UserRole.BANK_CLIENT, UserRole.SUPERVISOR].includes(
          (userRoleInChat ?? UserRole.CLIENT)
        )
      ) {
        const original = await this.messageLogRepo.findOne({
          where: {
            telegramMessageId: message.reply_to_message.message_id,
            telegramChatId: message.chat.id,
            questionStatus: "PENDING",
          },
        });
        if (original) {
          const responseTime =
            (log.sentAt.getTime() - original.sentAt.getTime()) / 1000;
          original.isReplyToMessageId = log.telegramMessageId;
          original.questionStatus = "ANSWERED";
          original.responseTimeSeconds = Math.round(responseTime);
          await this.messageLogRepo.save(original);
        }
        return;
      }

      // Reply-siz (vaqt oynasi + keyword) javob aniqlash
      if (
        [UserRole.ACCOUNTANT, UserRole.BANK_CLIENT, UserRole.SUPERVISOR].includes(
          (userRoleInChat ?? UserRole.CLIENT)
        )
      ) {
        const T_window = KPI_CONFIG.RESPONSE_TIME_WINDOW_MS;
        const keywordMatchThreshold = KPI_CONFIG.KEYWORD_MATCH_THRESHOLD;
        const now = log.sentAt.getTime();
        const pendingQuestions = await this.messageLogRepo.find({
          where: {
            telegramChatId: message.chat.id,
            questionStatus: "PENDING",
          },
        });
        const candidates = pendingQuestions.filter(
          (q) => now > q.sentAt.getTime() && now - q.sentAt.getTime() <= T_window,
        );
        if (candidates.length === 1) {
          // Faqat bitta savol - avtomatik bog'lash
          const q = candidates[0];
          const responseTime = (log.sentAt.getTime() - q.sentAt.getTime()) / 1000;
          q.isReplyToMessageId = log.telegramMessageId;
          q.questionStatus = "ANSWERED";
          q.responseTimeSeconds = Math.round(responseTime);
          await this.messageLogRepo.save(q);
          return;
        } else if (candidates.length > 1) {
          // Bir nechta savol - keyword match orqali
          let bestMatch: MessageLogEntity | null = null;
          let bestScore = 0;
          for (const q of candidates) {
            const overlap = 0;
            if (overlap > bestScore) {
              bestScore = overlap;
              bestMatch = q;
            }
          }
          if (bestMatch && bestScore >= keywordMatchThreshold) {
            const responseTime =
              (log.sentAt.getTime() - bestMatch.sentAt.getTime()) / 1000;
            bestMatch.isReplyToMessageId = log.telegramMessageId;
            bestMatch.questionStatus = "ANSWERED";
            bestMatch.responseTimeSeconds = Math.round(responseTime);
            await this.messageLogRepo.save(bestMatch);
            return;
          }
          // SUPERVISORga signal: noaniq bog'lanish
          this.logger.warn('Noaniq javob matching holati, supervisor xabardor qilinadi', { chatId: message.chat.id });
          await this.notifySupervisors(message.chat.id, 'Noaniq javob matching holati. Tekshiruv va tasdiqlash kerak.');
        }
      }
    } catch (error) {
      this.logger.error('processMessage xatolikka uchradi', error.stack || error.message || error);
      throw error;
    }
  }

  // SUPERVISORga signal yuborish uchun yordamchi metod
  private async notifySupervisors(chatId: string, notification: string) {
    this.logger.log(`notifySupervisors called for chatId=${chatId}, notification='${notification}'`);
    // Mas’ul SUPERVISORlarni aniqlash (UserChatRoleEntity orqali)
    // TODO: UserChatRoleEntity dan ushbu chat uchun SUPERVISORlarni topib, ularga notification yuboring.
    // Bu yerda TelegramService yoki ctx orqali xabar yuborish mumkin.
    // Masalan:
    // const supervisors = await this.userChatRoleRepository.find({ where: { chatId, role: UserRole.SUPERVISOR } });
    // supervisors.forEach(sup => this.telegramService.sendMessage(sup.userId, notification));
  }
}

