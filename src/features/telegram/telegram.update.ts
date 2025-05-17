import {
  Update,
  Start,
  Help,
  Ctx,
  Message,
  Command,
  On,
} from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { UseGuards } from '@nestjs/common';
import { Roles } from '../../shared/decorators/roles.decorator';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { UserRole } from '../../shared/enums/user-role.enum';
import { ResponseTimeService } from '../kpi-response-time/response-time.service';
import { UserService } from '../user-management/user.service';

@Update()
export class TelegramUpdate {
  constructor(
    private readonly responseTimeService: ResponseTimeService,
    private readonly userService: UserService,
  ) {}


@Update()
export class TelegramUpdate {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  @Start()
  async onStart(@Ctx() ctx: Context) {
    await ctx.reply(
      "FinCo KPI botiga xush kelibsiz! /help buyrug'i bilan yordam olishingiz mumkin.",
    );
  }

  @Help()
  async onHelp(@Ctx() ctx: Context) {
    await ctx.reply(
      'Bot yordamchisi: \n/start - Botni boshlash\n/help - Yordam\nSavollar uchun xabar yuboring.',
    );
  }

  @On('message')
  async onMessage(@Message() message: any, @Ctx() ctx: Context) {
    // Har bir xabarni loglash va KPI uchun ishlov berish
    await this.responseTimeService.processMessage(message, ctx);
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Command('assign_role')
  async assignRole(@Ctx() ctx: Context, @Message('text') text: string) {
    // /assign_role @username ROLE
    const [_, username, role] = text.split(' ');
    const user = await this.userService.findByTelegramIdOrUsername(username.replace('@', ''));
    if (!user) return ctx.reply('Foydalanuvchi topilmadi');
    const chatId = String(ctx.chat.id);
    await this.userService.assignRoleToUserInChat(user.id, chatId, role as UserRole, String(ctx.from.id));
    ctx.reply(`@${username} uchun rol: ${role} tayinlandi`);
  }
}
