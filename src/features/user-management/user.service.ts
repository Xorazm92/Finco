import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';

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

  async findByTelegramId(telegramId: string): Promise<UserEntity | undefined> {
    return (await this.userRepository.findOne({ where: { telegramId } })) ?? undefined;
  }

  async createOrUpdate(userData: Partial<UserEntity>): Promise<UserEntity> {
    let user = await this.findByTelegramId(userData.telegramId!);
    if (!user) {
      user = this.userRepository.create(userData);
    } else {
      Object.assign(user, userData);
    }
    return this.userRepository.save(user);
  }
}
