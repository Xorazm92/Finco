import { Controller, Get, Inject } from '@nestjs/common';
import { Ctx, On, Update } from 'nestjs-telegraf';
import { TelegramService } from './telegram.service';
import { UserService } from '../user-management/user.service';
import { MessageLogService } from '../message-log/message-log.service';
import { AiQueueService } from '../artificial-intelligence/ai-queue.service';
import { Context } from 'telegraf';

@Controller('telegram')
@Update()
export class TelegramController {
  constructor(
    private readonly telegramService: TelegramService,
    private readonly userService: UserService,
    private readonly messageLogService: MessageLogService,
    private readonly aiQueueService: AiQueueService,
  ) {}

  @Get('stats')
  getStats() {
    return {
      users: 0,
      messages: 0,
      status: 'ok',
      time: new Date().toISOString(),
    };
  }

  @On('message')
  async onMessage(@Ctx() ctx: Context) {
    const msg = ctx.message;
    if (!msg || !('chat' in msg) || !msg.from) return;
    const chatId = String(msg.chat.id);
    const telegramUserId = String(msg.from.id);

    // 1. Foydalanuvchi va roli
    const { user, userChatRole } = await this.userService.findOrCreateUserFromTelegramContext(msg);

    // 2. Savolni aniqlash (oddiy qoidalar)
    const hasText = typeof msg === 'object' && 'text' in msg && typeof msg.text === 'string';
    const isPotentialQuestion = hasText && (
      msg.text.includes('?') ||
      /mi\?|qachon|qanday|nima uchun/i.test(msg.text)
    );

    // 3. Loglash
    const textContent = (hasText ? msg.text : null);
    const isReplyToMessageId = (typeof msg === 'object' && 'reply_to_message' in msg && msg.reply_to_message && 'message_id' in msg.reply_to_message) ? msg.reply_to_message.message_id : null;
    const hasDocument = typeof msg === 'object' && 'document' in msg && !!msg.document;
    const hasPhoto = typeof msg === 'object' && 'photo' in msg && !!msg.photo;
    const hasAudio = typeof msg === 'object' && 'audio' in msg && !!msg.audio;
    const hasVoice = typeof msg === 'object' && 'voice' in msg && !!msg.voice;
    const hasAttachments = hasDocument || hasPhoto || hasAudio || hasVoice;
    let attachmentType = null;
    if (hasDocument) attachmentType = 'document';
    else if (hasPhoto) attachmentType = 'photo';
    else if (hasAudio) attachmentType = 'audio';
    else if (hasVoice) attachmentType = 'voice';
    const messageLog = await this.messageLogService.logMessage({
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
    const hasReplyTo = typeof msg === 'object' && 'reply_to_message' in msg && !!msg.reply_to_message;
    if (hasReplyTo && hasText) {
      // reply orqali javoblar uchun
      await this.aiQueueService.addSentimentJob(msg.text); // Yoki addReplyAnalysisJob
    } else {
      // reply'siz javoblar uchun (mas'ul xodimdan)
      if (["ACCOUNTANT", "BANK_CLIENT", "BANK_CLIENT_SPECIALIST"].includes(userChatRole.role) && hasText) {
        await this.aiQueueService.addSentimentJob(msg.text); // Yoki addPotentialReplyJob
      }
    }

    // Guruhdagi xabarlarni loglash va oddiy javob
    await this.telegramService.sendMessage(chatId, 'Bot xabaringizni oldi!');
  }
}
