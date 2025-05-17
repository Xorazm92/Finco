import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../user-management/entities/user.entity';
import { UserChatRoleEntity } from '../user-management/entities/user-chat-role.entity';
import { UserRole } from '../../shared/enums/user-role.enum';

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

  async findOne(id: number): Promise<UserEntity | undefined> {
    return (await this.userRepository.findOne({ where: { id } })) ?? undefined;
  }

  async findByTelegramId(
    telegramId: string,
  ): Promise<UserEntity | undefined> {
    return (
      (await this.userRepository.findOne({ where: { telegramId } })) ??
      undefined
    );
  }

  async getUserRoleInChat(userId: number, chatId: string): Promise<UserRole | null> {
    const userChatRole = await this.userChatRoleRepository.findOne({
      where: { userId, chatId },
    });
    return userChatRole ? userChatRole.role : null;
  }

  async createOrUpdate(userData: Partial<UserEntity>): Promise<UserEntity> {
    let user = await this.findByTelegramId(userData.telegramId!);
    if (!user) {
      user = this.userRepository.create({
        telegramId: userData.telegramId,
        firstName: userData.firstName,
        lastName: userData.lastName,
        username: userData.username,
        isActive: true,
      });
      user = await this.userRepository.save(user);
    }
    return user;
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
    // TODO: Parolni hash bilan solishtirish (demo uchun oddiy tekshiruv)
    const user = await this.userRepository.findOne({ where: { username } });
    if (user && user['password'] && user['password'] === password) {
      return user;
    }
    return null;
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

