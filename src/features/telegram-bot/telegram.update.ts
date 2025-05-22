// src/features/telegram-bot/telegram.update.ts
import { Update, Start, Help, Ctx, On, Message } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { Logger } from '@nestjs/common';
import { UserService } from '../user-management/user.service';
import { UserRole } from '../../shared/enums/user-role.enum';

@Update()
export class TelegramUpdate {
  private readonly logger = new Logger(TelegramUpdate.name);

  constructor(
    private readonly userService: UserService,
    // Keyinchalik boshqa servislarni ham shu yerda inject qilasiz
    // masalan: private readonly responseTimeService: ResponseTimeService
  ) {
    this.logger.log('TelegramUpdate class ishga tushdi');
  }

  /**
   * Har bir xabar yoki buyruq boshida foydalanuvchini ro‘yxatga olish uchun yordamchi metod.
   * Agar foydalanuvchi yoki uning chatdagi roli mavjud bo‘lmasa, avtomatik yaratiladi.
   */
  private async ensureUserRegistered(ctx: Context): Promise<void> {
    // ctx.message - bu Telegram xabari obyektini bildiradi
    const msg = (ctx as any).message || (ctx.update && (ctx.update as any).message);
    if (msg) {
      try {
        await this.userService.findOrCreateUserFromTelegramContext(msg, UserRole.CLIENT);
        this.logger.log(`Foydalanuvchi ro‘yxatdan o‘tkazildi: ${msg.from?.id} | Chat: ${msg.chat?.id}`);
      } catch (error) {
        this.logger.error(`Ro‘yxatdan o‘tkazishda xatolik: ${msg.from?.id} | Chat: ${msg.chat?.id}`, error.stack);
      }
    } else {
      this.logger.warn('Xabar topilmadi (ensureUserRegistered)');
    }
  }

  async onStart(@Ctx() ctx: Context) {
    this.logger.log('onStart handler ishladi');
    // Foydalanuvchini ro'yxatdan o'tkazish
    await this.ensureUserRegistered(ctx);
    // Botga xush kelibsiz xabari
    await ctx.reply("FinCo KPI botiga xush kelibsiz! /help buyrug‘i bilan yordam olishingiz mumkin.");
  }

  /**
   * /help buyrug‘i handleri
   */
  @Help()
  async onHelp(@Ctx() ctx: Context) {
    this.logger.log('onHelp handler ishladi');
    await this.ensureUserRegistered(ctx);
    await ctx.reply("Mavjud buyruqlar:\n/start - Botni boshlash\n/help - Yordam");
  }

  /**
   * Barcha xabarlarni ushlash (matn, rasm, ovoz va boshqalar)
   */
  @On('message')
  async onAnyMessage(@Message() message: any, @Ctx() ctx: Context) {
    this.logger.log('onAnyMessage handler ishladi, message:', JSON.stringify(message));
    await this.ensureUserRegistered(ctx);
    // Fallback: message bo'lmasa, hech narsa qilmaydi
    if (!message) {
      this.logger.warn('onAnyMessage: message aniqlanmadi');
      return;
    }
    // Bu yerda boshqa servislarni chaqirish mumkin (masalan, loglash, AI tahlil)
    if (message.text && !message.text.startsWith('/')) {
      this.logger.log(`Oddiy matnli xabar: ${message.text}`);
      // await ctx.reply(`Siz yuborgan matn: "${message.text}"`);
    }
  }
}