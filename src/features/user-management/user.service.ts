import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../user-management/entities/user.entity';
import { UserRole } from '../../shared/enums/user-role.enum';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async findAll(): Promise<UserEntity[]> {
    return this.userRepository.find();
  }

  async findOne(id: number): Promise<UserEntity | undefined> {
    return (await this.userRepository.findOne({ where: { id } })) ?? undefined;
  }

  async findByTelegramIdAndChatId(
    telegramId: string,
    chatId: string,
  ): Promise<UserEntity | undefined> {
    return (
      (await this.userRepository.findOne({ where: { telegramId, chatId } })) ??
      undefined
    );
  }

  async createOrUpdate(userData: Partial<UserEntity>): Promise<UserEntity> {
    let user = await this.findByTelegramIdAndChatId(
      userData.telegramId!,
      userData.chatId!,
    );
    if (!user) {
      user = this.userRepository.create(userData);
    } else {
      Object.assign(user, userData);
    }
    return this.userRepository.save(user);
  }

  async assignRole(
    telegramId: string,
    chatId: string,
    role: UserRole,
  ): Promise<UserEntity> {
    let user = await this.findByTelegramIdAndChatId(telegramId, chatId);
    if (!user) {
      user = this.userRepository.create({ telegramId, chatId, role });
    } else {
      user.role = role;
    }
    return this.userRepository.save(user);
  }

  async getUserRole(
    telegramId: string,
    chatId: string,
  ): Promise<UserRole | null> {
    const user = await this.findByTelegramIdAndChatId(telegramId, chatId);
    return user ? user.role : null;
  }
}
