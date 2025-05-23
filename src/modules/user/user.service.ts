import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { UserChatRole } from './user-chat-role.entity';
import { UserRole } from '../../shared/enums/user-role.enum';
import { TelegramService } from '../../features/telegram-bot/telegram.service';
import { AuditLogService } from '../../audit/audit-log.service';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(UserChatRole) private userChatRoleRepo: Repository<UserChatRole>,
    private telegramService: TelegramService,
    private auditLogService: AuditLogService,
  ) {}

  async findOrCreateUserWithDefaultRoleInChat(
    telegramFrom: { id: string; first_name: string; username?: string },
    telegramChat: { id: string },
    defaultRole: UserRole
  ) {
    let user = await this.userRepo.findOne({ where: { telegramId: telegramFrom.id } });
    let isNewUser = false;
    if (!user) {
      user = this.userRepo.create({
        telegramId: telegramFrom.id,
        firstName: telegramFrom.first_name,
        username: telegramFrom.username,
      });
      try {
        this.logger.debug('Attempting to save User:', JSON.stringify(user));
        await this.userRepo.save(user);
        this.logger.debug('User saved successfully:', JSON.stringify(user));
      } catch (e) {
        this.logger.error('ERROR SAVING USER:', e.message, e.stack, JSON.stringify(user));
      }
      isNewUser = true;
      // Audit log for new user
      await this.auditLogService.logAction(
        'new_user',
        telegramFrom.id,
        telegramFrom.id,
        {
          firstName: telegramFrom.first_name,
          username: telegramFrom.username,
          chatId: telegramChat.id,
        }
      );
    }
    let userChatRole = await this.userChatRoleRepo.findOne({ where: { user: user, chatId: telegramChat.id } });
    let isNewRole = false;
    if (!userChatRole) {
      userChatRole = this.userChatRoleRepo.create({
        user,
        chatId: telegramChat.id,
        role: defaultRole,
      });
      try {
        this.logger.debug('Attempting to save UserChatRole:', JSON.stringify(userChatRole));
        await this.userChatRoleRepo.save(userChatRole);
        this.logger.debug('UserChatRole saved successfully:', JSON.stringify(userChatRole));
      } catch (e) {
        this.logger.error('ERROR SAVING USER CHAT ROLE:', e.message, e.stack, JSON.stringify(userChatRole));
      }
      isNewRole = true;
      // Audit log for new role
      await this.auditLogService.logAction(
        'assign_role',
        telegramFrom.id,
        telegramFrom.id,
        {
          chatId: telegramChat.id,
          newRole: defaultRole,
          previousRole: null,
        }
      );
    }
    // Notify admin if new user or new role
    if (isNewUser || isNewRole) {
      await this.telegramService.sendMessageToAdmin(
        `Yangi foydalanuvchi: ${user.firstName} @${user.username || ''} (${user.telegramId})\nChat: ${telegramChat.id}\nRol: ${defaultRole}\n/assign_role ${user.telegramId} <YANGI_ROL> ${telegramChat.id}`
      );
    }
    return user;
  }

  async assignRoleToUserInChat(adminTelegramId: string, targetTelegramId: string, chatId: string, role: UserRole) {
    const adminRole = await this.getUserRoleInChat(adminTelegramId, chatId);
    if (adminRole !== UserRole.ADMIN) throw new Error('Faqat ADMIN rol tayinlay oladi');
    const user = await this.userRepo.findOne({ where: { telegramId: targetTelegramId } });
    if (!user) throw new Error('Foydalanuvchi topilmadi');
    let userChatRole = await this.userChatRoleRepo.findOne({ where: { user, chatId } });
    let actionType = 'assign_role';
    let previousRole = userChatRole ? userChatRole.role : null;
    if (!userChatRole) {
      userChatRole = this.userChatRoleRepo.create({ user, chatId, role });
    } else {
      userChatRole.role = role as UserRole;
    }
    try {
      this.logger.debug('Attempting to save UserChatRole (assignRoleToUserInChat):', JSON.stringify(userChatRole));
      await this.userChatRoleRepo.save(userChatRole);
      this.logger.debug('UserChatRole saved successfully (assignRoleToUserInChat):', JSON.stringify(userChatRole));
    } catch (e) {
      this.logger.error('ERROR SAVING USER CHAT ROLE (assignRoleToUserInChat):', e.message, e.stack, JSON.stringify(userChatRole));
      throw e;
    }
    // Audit log
    await this.auditLogService.logAction(
      actionType,
      adminTelegramId,
      targetTelegramId,
      {
        chatId,
        newRole: role,
        previousRole,
      }
    );
    return userChatRole;
  }

  async getUserRoleInChat(telegramId: string, chatId: string): Promise<UserRole> {
    const user = await this.userRepo.findOne({ where: { telegramId } });
    if (!user) return UserRole.AWAITING_APPROVAL;
    const userChatRole = await this.userChatRoleRepo.findOne({ where: { user, chatId } });
    if (!userChatRole || !Object.values(UserRole).includes(userChatRole.role as UserRole)) {
      return UserRole.AWAITING_APPROVAL;
    }
    return userChatRole.role as UserRole;
  }
}

