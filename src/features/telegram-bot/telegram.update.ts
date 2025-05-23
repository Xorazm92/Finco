import { Update, Start, Ctx, On } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { UserService } from '../user-management/user.service';
import { Logger } from '@nestjs/common';

@Update()
export class TelegramUpdate {
  private readonly logger = new Logger(TelegramUpdate.name);

  constructor(private readonly userService: UserService) {}

  @Start()
  async onStart(@Ctx() ctx: Context) {
    try {
      const { user, isNewUser } = await this.userService.findOrCreateUserFromTelegramContext(ctx.message);
      await ctx.reply(isNewUser ? 'Xush kelibsiz!' : 'Qayta ko\'rishganimdan xursandman!');
    } catch (error) {
      this.logger.error('Start command error:', error);
      await ctx.reply('Xatolik yuz berdi. Iltimos qayta urinib ko\'ring.');
    }
  }

  @On('message')
  async onMessage(@Ctx() ctx: Context) {
    try {
      await this.userService.ensureUserRegistered(ctx.message);
      // Message handling logic will be added here
    } catch (error) {
      this.logger.error('Message handling error:', error);
    }
  }
}