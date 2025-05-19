import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../user-management/entities/user.entity';
import { UserChatRoleEntity } from '../user-management/entities/user-chat-role.entity';
import { UserRole } from '../../shared/enums/user-role.enum';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserService {
  // TODO: ConfigService dan ADMIN_TELEGRAM_ID olish uchun inject qiling (agar kerak bo‘lsa)

  /**
   * Telegramdan kelgan xabar orqali userni avtomatik ro‘yxatga olish va chat uchun rol biriktirish.
   * @param message Telegram xabari (node-telegram-bot-api Message)
   * @param defaultRoleInChat Standart rol (masalan, CLIENT)
   * @returns user, userChatRole, isNewUser, isNewRoleInChat
   */
  async findOrCreateUserFromTelegramContext(
    message: any, // TelegramBot.Message
    defaultRoleInChat: UserRole = UserRole.CLIENT,
  ): Promise<{ user: UserEntity; userChatRole: UserChatRoleEntity; isNewUser: boolean; isNewRoleInChat: boolean }> {
    const telegramUser = message.from;
    const chatId = message.chat.id;
    if (!telegramUser) throw new Error('Telegram user data not found in context.');
    let user = await this.userRepository.findOne({ where: { telegramId: String(telegramUser.id) }, relations: ['chatRoles'] });
    let isNewUser = false;
    if (!user) {
      user = this.userRepository.create({
        telegramId: String(telegramUser.id),
        firstName: telegramUser.first_name,
        lastName: telegramUser.last_name,
        username: telegramUser.username,
        
        isActive: true,
        
        chatRoles: [],
      });
      await this.userRepository.save(user);
      isNewUser = true;
      // TODO: ADMINga yangi foydalanuvchi haqida xabar yuborish (TelegramService orqali)
    }
    let userChatRole = user.chatRoles?.find(cr => cr.chatId == chatId);
    let isNewRoleInChat = false;
    if (!userChatRole) {
      userChatRole = this.userChatRoleRepository.create({
        user: user,
        userId: user.id,
        chatId: String(chatId),
        role: defaultRoleInChat,
      });
      await this.userChatRoleRepository.save(userChatRole);
      user.chatRoles?.push(userChatRole);
      isNewRoleInChat = true;
      // TODO: ADMINga yangi chat uchun rol tayinlangani haqida xabar yuborish
    }
    return { user, userChatRole, isNewUser, isNewRoleInChat };
  }

  /**
   * ADMIN tomonidan userga chat uchun rol tayinlash
   */
  async assignRoleToUser(
    adminTelegramId: string, // kim tayinlayapti
    targetTelegramId: string,
    chatId: string,
    role: UserRole,
  ): Promise<UserChatRoleEntity> {
    const targetUser = await this.userRepository.findOne({ where: { telegramId: String(targetTelegramId) }, relations: ['chatRoles'] });
    if (!targetUser) throw new NotFoundException(`User with Telegram ID ${targetTelegramId} not found.`);
    let userChatRole = targetUser.chatRoles?.find(cr => cr.chatId == chatId);
    if (userChatRole) {
      userChatRole.role = role;
    } else {
      userChatRole = this.userChatRoleRepository.create({
        user: targetUser,
        userId: targetUser.id,
        chatId: String(chatId),
        role: role,
      });
    }
    await this.userChatRoleRepository.save(userChatRole);
    // TODO: ADMINga log yoki bildirishnoma yuborish (TelegramService orqali)
    return userChatRole;
  }
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(UserChatRoleEntity)
    private readonly userChatRoleRepository: Repository<UserChatRoleEntity>,
  ) {}

  async findAll(): Promise<UserEntity[]> {
    return this.userRepository.find();
  }

  async findOne(id: number): Promise<UserEntity> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Foydalanuvchi topilmadi');
    const rest = user;
    return rest as UserEntity;
  }

  async findByTelegramId(
    telegramId: string,
  ): Promise<UserEntity | undefined> {
    return (
      (await this.userRepository.findOne({ where: { telegramId } })) ??
      undefined
    );
  }

  /**
   * Telegram ID orqali user id ni qaytaradi (agar mavjud bo'lsa)
   */
  async getUserIdByTelegram(telegramId: string | number): Promise<number | null> {
    const user = await this.userRepository.findOne({ where: { telegramId: String(telegramId) } });
    return user ? user.id : null;
  }

  async getUserRoleInChat(userId: number, chatId: string): Promise<UserRole | null> {
    const userChatRole = await this.userChatRoleRepository.findOne({
      where: { userId, chatId },
    });
    return userChatRole ? userChatRole.role : null;
  }

  async createOrUpdate(userData: Partial<UserEntity>): Promise<UserEntity> {
    // Username yoki telegramId allaqachon mavjudligini tekshirish
    if (userData.username) {
      const existingByUsername = await this.userRepository.findOne({ where: { username: userData.username } });
      if (existingByUsername) {
        throw new BadRequestException('Bunday username allaqachon mavjud');
      }
    }
    if (userData.telegramId) {
      const existingByTelegramId = await this.userRepository.findOne({ where: { telegramId: userData.telegramId } });
      if (existingByTelegramId) {
        throw new BadRequestException('Bunday Telegram ID allaqachon mavjud');
      }
    }
    // No password check, just create user
    const user = this.userRepository.create({
      telegramId: userData.telegramId,
      firstName: userData.firstName,
      lastName: userData.lastName,
      username: userData.username,
      isActive: true,
    });
    const savedUser = await this.userRepository.save(user);
    return savedUser;
  }

  async assignRoleToUserInChat(
    userId: number,
    chatId: string,
    role: UserRole,
    assignedBy?: string,
  ): Promise<UserChatRoleEntity> {
    let userChatRole = await this.userChatRoleRepository.findOne({ where: { userId, chatId } });
    let assignedByUserIdNum: number | undefined = undefined;
    if (assignedBy) {
      const assignedByUser = await this.userRepository.findOne({ where: { telegramId: String(assignedBy) } });
      if (assignedByUser) assignedByUserIdNum = assignedByUser.id;
    }
    if (!userChatRole) {
      userChatRole = this.userChatRoleRepository.create({ userId: Number(userId), chatId: String(chatId), role, assignedByUserId: assignedByUserIdNum });
    } else {
      userChatRole.role = role;
      if (assignedByUserIdNum !== undefined) userChatRole.assignedByUserId = assignedByUserIdNum;
    }
    return this.userChatRoleRepository.save(userChatRole);
  }

  async getUserRole(
    telegramId: string,
    chatId: string,
  ): Promise<UserRole | null> {
    const user = await this.findByTelegramId(telegramId);
    if (!user) return null;
    return this.getUserRoleInChat(user.id, chatId);
  }

  /**
   * Username/password orqali foydalanuvchini tekshiradi (login uchun)
   */
  async validateUser(username: string, password: string): Promise<UserEntity | null> {
    const fs = require('fs');
    fs.appendFileSync('diagnostic.log', `VALIDATE USER: ${username} ${password}\n`);
    const user = await this.userRepository.findOne({ where: { username } });
    fs.appendFileSync('diagnostic.log', `FOUND USER: ${JSON.stringify(user)}\n`);
    // Password check removed; just return user if found
    if (user) {
      return user;
    }
    return null;
  }

  /**
   * Foydalanuvchini yangilash (ADMIN uchun)
   */
  async updateUser(id: number, dto: Partial<UserEntity>): Promise<UserEntity> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Foydalanuvchi topilmadi');
    Object.assign(user, dto);
    await this.userRepository.save(user);
    return user;
  }

  /**
   * Foydalanuvchini o'chirish (ADMIN uchun)
   */
  async deleteUser(id: number): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Foydalanuvchi topilmadi');
    await this.userRepository.delete(id);
  }

  /**
   * Foydalanuvchini ID orqali topish (JWT uchun)
   */
  async findById(id: number): Promise<UserEntity | null> {
    return (await this.userRepository.findOne({ where: { id } })) ?? null;
  }

  /**
   * Telegram ID yoki username orqali userni topish
   */
  async findByTelegramIdOrUsername(identifier: string): Promise<UserEntity | null> {
    let user = await this.userRepository.findOne({ where: { telegramId: identifier } });
    if (!user) {
      user = await this.userRepository.findOne({ where: { username: identifier } });
    }
    return user ?? null;
  }
}

