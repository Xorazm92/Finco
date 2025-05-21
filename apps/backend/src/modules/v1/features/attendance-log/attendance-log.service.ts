import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AttendanceLogEntity } from './entities/attendance-log.entity';
import { UserEntity } from '../user-management/entities/user.entity';

@Injectable()
export class AttendanceLogService {
  constructor(
    @InjectRepository(AttendanceLogEntity)
    private readonly attendanceLogRepo: Repository<AttendanceLogEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
  ) {}

  async checkIn(userId: number, chatId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) return null;
    // Check if already checked in today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const { MoreThanOrEqual } = require('typeorm');
    const exist = await this.attendanceLogRepo.findOne({
      where: {
        user,
        telegramChatId: chatId,
        checkinAt: MoreThanOrEqual(today),
      },
    });
    if (exist) return exist;
    // Check if late (after 08:30)
    const now = new Date();
    const isLate =
      now.getHours() > 8 || (now.getHours() === 8 && now.getMinutes() > 30);
    const log = this.attendanceLogRepo.create({
      user,
      telegramChatId: chatId,
      checkinAt: now,
      isLate,
    });
    return this.attendanceLogRepo.save(log);
  }

  async checkOut(userId: number, chatId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) return null;
    // Find today's check-in
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const { MoreThanOrEqual } = require('typeorm');
    const log = await this.attendanceLogRepo.findOne({
      where: {
        user,
        telegramChatId: chatId,
        checkinAt: MoreThanOrEqual(today),
      },
    });
    if (!log) return null;
    log.checkoutAt = new Date();
    return this.attendanceLogRepo.save(log);
  }
}
