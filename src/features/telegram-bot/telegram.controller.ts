import { Controller, Get, Inject } from '@nestjs/common';
import { Ctx, On, Update } from 'nestjs-telegraf';
import { TelegramService } from './telegram.service';
import { UserService } from '../user-management/user.service';
import { Context } from 'telegraf';

@Controller('telegram')
@Update()
export class TelegramController {
  constructor(
    private readonly telegramService: TelegramService,
    private readonly userService: UserService,
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
    const isPotentialQuestion = !!msg.text && (
      msg.text.includes('?') ||
      /mi\?|qachon|qanday|nima uchun/i.test(msg.text)
    );

    // 3. Loglash
    const messageLog = await this.messageLogService.logMessage({
      telegramMessageId: msg.message_id,
      telegramChatId: chatId,
      senderTelegramId: telegramUserId,
      senderRoleAtMoment: userChatRole.role,
      sentAt: new Date(msg.date * 1000),
      textContent: msg.text ?? null,
      isReplyToMessageId: msg.reply_to_message?.message_id ?? null,
      hasAttachments: !!(msg.document || msg.photo || msg.audio || msg.voice),
      attachmentType: msg.document ? 'document' : msg.photo ? 'photo' : msg.audio ? 'audio' : msg.voice ? 'voice' : null,
      isQuestion: isPotentialQuestion,
    });

    // 4. Savol bo‘lsa, AI tahliliga navbatga qo‘shish
    if (isPotentialQuestion) {
      await this.aiQueueService.addSentimentJob(msg.text); // Yoki addQuestionAnalysisJob
    }

    // 5. Javob bo‘lsa, reply orqali yoki reply'siz (AI) tahlil uchun navbatga qo‘shish
    if (msg.reply_to_message) {
      // reply orqali javoblar uchun
      await this.aiQueueService.addSentimentJob(msg.text); // Yoki addReplyAnalysisJob
    } else {
      // reply'siz javoblar uchun (mas'ul xodimdan)
      if (["ACCOUNTANT", "BANK_CLIENT", "BANK_CLIENT_SPECIALIST"].includes(userChatRole.role)) {
        await this.aiQueueService.addSentimentJob(msg.text); // Yoki addPotentialReplyJob
      }
    }

    // Guruhdagi xabarlarni loglash va oddiy javob
    await this.telegramService.sendMessage(chatId, 'Bot xabaringizni oldi!');
  }
}
