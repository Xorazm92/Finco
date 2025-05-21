import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MessageLogEntity } from '../message-log/entities/message-log.entity';

@Injectable()
export class KpiReportService {
  constructor(
    @InjectRepository(MessageLogEntity)
    private readonly messageLogRepo: Repository<MessageLogEntity>,
  ) {}

  async getDashboardStats(chatId: string) {
    // ... (old code remains unchanged)
  }

  async getWeeklyKpiTrend(chatId: number, weeks: number = 4) {
    // Har hafta uchun savollar va javoblar sonini hisoblash
    const now = new Date();
    const trend = [];
    for (let i = weeks - 1; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - 7 * i);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 7);

      const totalQuestions = await this.messageLogRepo.createQueryBuilder('msg')
        .where('msg.telegramChatId = :chatId', { chatId })
        .andWhere('msg.isQuestion = true')
        .andWhere('msg.sentAt >= :start', { start: weekStart })
        .andWhere('msg.sentAt < :end', { end: weekEnd })
        .getCount();

      const answeredQuestions = await this.messageLogRepo.createQueryBuilder('msg')
        .where('msg.telegramChatId = :chatId', { chatId })
        .andWhere('msg.isQuestion = true')
        .andWhere('msg.questionStatus = :status', { status: 'ANSWERED' })
        .andWhere('msg.sentAt >= :start', { start: weekStart })
        .andWhere('msg.sentAt < :end', { end: weekEnd })
        .getCount();

      trend.push({
        week: `${weekStart.toISOString().slice(0, 10)} - ${weekEnd.toISOString().slice(0, 10)}`,
        totalQuestions,
        answeredQuestions,
        unansweredPercent: totalQuestions === 0 ? 0 : Math.round(100 * (totalQuestions - answeredQuestions) / totalQuestions),
      });
    }
    return trend;
  }
}

