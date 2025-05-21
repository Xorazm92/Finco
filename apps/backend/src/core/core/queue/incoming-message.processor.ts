import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { Injectable, Logger } from '@nestjs/common';
import { UserService } from '../../features/user-management/user.service';
import { MessageLogService } from '../../features/message-log/message-log.service';
import { AiQueueService } from '../../features/artificial-intelligence/ai-queue.service';

@Processor('incoming_messages_queue')
@Injectable()
export class IncomingMessageProcessor {
  private readonly logger = new Logger(IncomingMessageProcessor.name);

  constructor(
    private readonly userService: UserService,
    private readonly messageLogService: MessageLogService,
    private readonly aiQueueService: AiQueueService,
  ) {}

  @Process('incoming')
  async handle(job: Job<any>) {
    const update = job.data;
    if (!update?.message || !update.message.chat || !update.message.from) {
      this.logger.warn('Noto‘g‘ri Telegram update:', update);
      return;
    }
    const msg = update.message;
    const chatId = String(msg.chat.id);
    const telegramUserId = String(msg.from.id);

    try {
      // 1. Foydalanuvchi va roli
      const { user, userChatRole } =
        await this.userService.findOrCreateUserFromTelegramContext(msg);

      // 2. Savolni aniqlash (oddiy qoidalar)
      const hasText =
        typeof msg === 'object' &&
        'text' in msg &&
        typeof msg.text === 'string';
      const isPotentialQuestion =
        hasText &&
        (msg.text.includes('?') ||
          /mi\?|qachon|qanday|nima uchun/i.test(msg.text));

      // 3. Loglash
      const textContent = hasText ? msg.text : null;
      const isReplyToMessageId =
        typeof msg === 'object' &&
        'reply_to_message' in msg &&
        msg.reply_to_message &&
        'message_id' in msg.reply_to_message
          ? msg.reply_to_message.message_id
          : null;
      const hasDocument =
        typeof msg === 'object' && 'document' in msg && !!msg.document;
      const hasPhoto = typeof msg === 'object' && 'photo' in msg && !!msg.photo;
      const hasAudio = typeof msg === 'object' && 'audio' in msg && !!msg.audio;
      const hasVoice = typeof msg === 'object' && 'voice' in msg && !!msg.voice;
      const hasAttachments = hasDocument || hasPhoto || hasAudio || hasVoice;
      let attachmentType = null;
      if (hasDocument) attachmentType = 'document';
      else if (hasPhoto) attachmentType = 'photo';
      else if (hasAudio) attachmentType = 'audio';
      else if (hasVoice) attachmentType = 'voice';

      await this.messageLogService.logMessage({
        telegramMessageId: msg.message_id,
        telegramChatId: Number(chatId),
        senderTelegramId: telegramUserId,
        senderRoleAtMoment: userChatRole.role,
        sentAt: new Date(msg.date * 1000),
        textContent,
        isReplyToMessageId,
        hasAttachments,
        attachmentType,
        isQuestion: isPotentialQuestion,
      });

      // 4. Savol bo‘lsa, AI tahliliga navbatga qo‘shish
      if (isPotentialQuestion && hasText) {
        await this.aiQueueService.addSentimentJob(msg.text); // Yoki addQuestionAnalysisJob
      }

      // 5. Javob bo‘lsa, reply orqali yoki reply'siz (AI) tahlil uchun navbatga qo‘shish
      const hasReplyTo =
        typeof msg === 'object' &&
        'reply_to_message' in msg &&
        !!msg.reply_to_message;
      if (hasReplyTo && hasText) {
        await this.aiQueueService.addSentimentJob(msg.text); // Yoki addReplyAnalysisJob
      } else {
        if (
          ['ACCOUNTANT', 'BANK_CLIENT', 'BANK_CLIENT_SPECIALIST'].includes(
            userChatRole.role,
          ) &&
          hasText
        ) {
          await this.aiQueueService.addSentimentJob(msg.text); // Yoki addPotentialReplyJob
        }
      }

      this.logger.log(
        `Xabar qayta ishlovchi worker orqali loglandi: chat_id=${chatId}, user_id=${telegramUserId}`,
      );
    } catch (error) {
      this.logger.error('Workerda xatolik:', error);
    }
  }
}
