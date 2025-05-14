import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MessageLogEntity } from './entities/message-log.entity';
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

  async processMessage(message: any, ctx: any) {
    // Userni bazaga qo‘shish yoki olish
    let user = await this.userRepo.findOne({ where: { telegramId: String(message.from.id) } });
    if (!user) {
      user = this.userRepo.create({
        telegramId: String(message.from.id),
        firstName: message.from.first_name,
        lastName: message.from.last_name ?? undefined,
        username: message.from.username ?? undefined,
        role: UserRole.BANK_CLIENT,
        isActive: true,
      } as Partial<UserEntity>);
      await this.userRepo.save(user);
    }
    // Xabar logini saqlash
    const log = this.messageLogRepo.create({
      telegramMessageId: String(message.message_id),
      telegramChatId: String(message.chat.id),
      senderUser: user,
      sentAt: new Date(message.date * 1000),
      textPreview: message.text?.slice(0, 255),
      isQuestionCandidate: /[?]|savol|iltimos/i.test(message.text || ''),
      repliedToMessageId: message.reply_to_message?.message_id ? String(message.reply_to_message.message_id) : undefined,
    });
    await this.messageLogRepo.save(log);
    // Agar reply bo‘lsa, javob vaqtini hisoblash
    if (message.reply_to_message) {
      const original = await this.messageLogRepo.findOne({
        where: { telegramMessageId: String(message.reply_to_message.message_id) },
      });
      if (original) {
        const responseTime = (log.sentAt.getTime() - original.sentAt.getTime()) / 1000;
        original.replyByUser = user;
        original.repliedAt = log.sentAt;
        original.responseTimeSeconds = Math.round(responseTime);
        await this.messageLogRepo.save(original);
      }
    }
  }
}
