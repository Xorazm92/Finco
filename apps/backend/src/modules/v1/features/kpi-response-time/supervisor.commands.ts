import { Ctx, Command, Message } from 'nestjs-telegraf';
import { UseGuards } from '@nestjs/common';
import { Context } from 'telegraf';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MessageLogEntity } from '../message-log/entities/message-log.entity';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { UserRole } from '../../shared/enums/user-role.enum';

@Injectable()
export class SupervisorCommands {
  constructor(
    @InjectRepository(MessageLogEntity)
    private readonly messageLogRepo: Repository<MessageLogEntity>,
  ) {}

  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPERVISOR)
  @Command('pending_matches')
  async pendingMatches(@Ctx() ctx: Context) {
    const chatId = Number(ctx.chat?.id);
    const pending = await this.messageLogRepo.find({
      where: {
        telegramChatId: chatId,
        questionStatus: 'PENDING',
      },
    });
    if (!pending.length) return ctx.reply('Noaniq matching holatlari yo‘q.');
    for (const msg of pending) {
      await ctx.reply(
        `#pending\nSavol: ${msg.textContent}\nMessageID: ${msg.telegramMessageId}\nYuborilgan: ${msg.sentAt}`,
      );
    }
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPERVISOR)
  @Command('approve_match')
  async approveMatch(@Ctx() ctx: Context, @Message('text') text: string) {
    const [_, messageId] = text.split(' ');
    const chatId = Number(ctx.chat?.id);
    const log = await this.messageLogRepo.findOne({
      where: {
        telegramChatId: chatId,
        telegramMessageId: Number(messageId),
        questionStatus: 'PENDING',
      },
    });
    if (!log) return ctx.reply('Topilmadi yoki allaqachon tasdiqlangan.');
    log.questionStatus = 'ANSWERED';
    await this.messageLogRepo.save(log);
    ctx.reply('Matching tasdiqlandi.');
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPERVISOR)
  @Command('reject_match')
  async rejectMatch(@Ctx() ctx: Context, @Message('text') text: string) {
    const [_, messageId] = text.split(' ');
    const chatId = Number(ctx.chat?.id);
    const log = await this.messageLogRepo.findOne({
      where: {
        telegramChatId: chatId,
        telegramMessageId: Number(messageId),
        questionStatus: 'PENDING',
      },
    });
    if (!log) return ctx.reply('Topilmadi yoki allaqachon rad etilgan.');
    log.questionStatus = 'TIMEOUT';
    await this.messageLogRepo.save(log);
    ctx.reply('Matching rad etildi.');
  }
}
