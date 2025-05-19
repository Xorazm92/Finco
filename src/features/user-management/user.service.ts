import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../user-management/entities/user.entity';
import { UserChatRoleEntity } from '../user-management/entities/user-chat-role.entity';
import { UserRole } from '../../shared/enums/user-role.enum';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserService {
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
    const { password, ...rest } = user;
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
    if (!userData.password) {
      throw new BadRequestException('Parol majburiy');
    }
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const user = this.userRepository.create({
      telegramId: userData.telegramId,
      firstName: userData.firstName,
      lastName: userData.lastName,
      username: userData.username,
      password: hashedPassword,
      isActive: true,
      role: userData.role ?? UserRole.CLIENT,
    });
    const savedUser = await this.userRepository.save(user);
    const { password, ...rest } = savedUser;
    return rest as UserEntity;
  }

  async assignRoleToUserInChat(
    userId: number,
    chatId: string,
    role: UserRole,
    assignedBy?: string,
  ): Promise<UserChatRoleEntity> {
    let userChatRole = await this.userChatRoleRepository.findOne({ where: { userId, chatId } });
    if (!userChatRole) {
      userChatRole = this.userChatRoleRepository.create({ userId, chatId, role, assignedBy });
    } else {
      userChatRole.role = role;
      if (assignedBy) userChatRole.assignedBy = assignedBy;
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
    if (user && user.password && await bcrypt.compare(password, user.password)) {
      // Parolni javobdan olib tashlash
      const { password, ...rest } = user;
      return rest as UserEntity;
    }
    return null;
  }

  /**
   * Foydalanuvchini yangilash (ADMIN uchun)
   */
  async updateUser(id: number, dto: Partial<UserEntity>): Promise<UserEntity> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Foydalanuvchi topilmadi');
    if (dto.password) {
      dto.password = await bcrypt.hash(dto.password, 10);
    }
    Object.assign(user, dto);
    await this.userRepository.save(user);
    const { password, ...rest } = user;
    return rest as UserEntity;
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

