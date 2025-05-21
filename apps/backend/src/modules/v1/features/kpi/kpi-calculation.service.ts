import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { MessageLogEntity } from '../message-log/entities/message-log.entity';
import { ReportLogEntity } from '../kpi-report-submission/entities/report-log.entity';
import { UserEntity } from '../user-management/entities/user.entity';

@Injectable()
export class KpiCalculationService {
  // Fetch all KPI scores for a user, company, and period (e.g. '2024-05')
  async getUserKpiScoresForPeriod(userId: number, companyId: number, period: string) {
    // Parse period to get start and end dates
    const [year, month] = period.split('-').map(Number);
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1);
    // KpiEntity must have companyId or be filterable by assignment
    // If not, adjust logic accordingly
    return this.kpiRepo.find({
      where: {
        user: { id: userId },
        createdAt: Between(start, end),
        // company: { id: companyId }, // Uncomment if KpiEntity has company relation
      },
      order: { createdAt: 'ASC' },
    });
  }
  constructor(
    @InjectRepository(MessageLogEntity)
    private readonly messageLogRepo: Repository<MessageLogEntity>,
    @InjectRepository(ReportLogEntity)
    private readonly reportLogRepo: Repository<ReportLogEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(require('./entities/kpi.entity').KpiEntity)
    private readonly kpiRepo: Repository<any>,
  ) {}

  /**
   * Foydalanuvchi uchun KPI statistikalarini hisoblash
   */
  async getUserKpiStats(telegramId: string, periodDays = 30) {
    const now = new Date();
    const fromDate = new Date(now.getTime() - periodDays * 24 * 60 * 60 * 1000);
    const questions = await this.messageLogRepo.find({
      where: {
        senderTelegramId: telegramId,
        isQuestion: true,
        sentAt: fromDate <= now ? fromDate : now,
      },
    });
    const totalQuestions = questions.length;
    const unanswered = questions.filter(q => q.questionStatus !== 'ANSWERED');
    const unansweredPercent = totalQuestions ? Math.round((unanswered.length / totalQuestions) * 100) : 0;
    const answered = questions.filter(q => q.questionStatus === 'ANSWERED');
    const avgResponseTime = answered.length ? Math.round(answered.reduce((a, b) => a + (b.responseTimeSeconds || 0), 0) / answered.length) : null;
    return {
      totalQuestions,
      unansweredQuestions: unanswered.length,
      unansweredPercent,
      avgResponseTimeSeconds: avgResponseTime,
    };
  }

  /**
   * Guruh uchun KPI statistikalarini hisoblash
   */
  async getGroupKpiStats(chatId: string | number, periodDays = 30) {
    const now = new Date();
    const fromDate = new Date(now.getTime() - periodDays * 24 * 60 * 60 * 1000);
    const questions = await this.messageLogRepo.find({
      where: {
        telegramChatId: typeof chatId === 'string' ? parseInt(chatId, 10) : chatId,
        isQuestion: true,
        sentAt: fromDate <= now ? fromDate : now,
      },
    });
    const totalQuestions = questions.length;
    const unanswered = questions.filter(q => q.questionStatus !== 'ANSWERED');
    const unansweredPercent = totalQuestions ? Math.round((unanswered.length / totalQuestions) * 100) : 0;
    const answered = questions.filter(q => q.questionStatus === 'ANSWERED');
    const avgResponseTime = answered.length ? Math.round(answered.reduce((a, b) => a + (b.responseTimeSeconds || 0), 0) / answered.length) : null;
    return {
      totalQuestions,
      unansweredQuestions: unanswered.length,
      unansweredPercent,
      avgResponseTimeSeconds: avgResponseTime,
    };
  }

  /**
   * Umumiy (system-wide) KPI statistikasi
   */
  async getSummaryKpiStats(periodDays = 30) {
    const now = new Date();
    const fromDate = new Date(now.getTime() - periodDays * 24 * 60 * 60 * 1000);
    const questions = await this.messageLogRepo.find({
      where: {
        isQuestion: true,
        sentAt: fromDate <= now ? fromDate : now,
      },
    });
    const totalQuestions = questions.length;
    const unanswered = questions.filter(q => q.questionStatus !== 'ANSWERED');
    const unansweredPercent = totalQuestions ? Math.round((unanswered.length / totalQuestions) * 100) : 0;
    const answered = questions.filter(q => q.questionStatus === 'ANSWERED');
    const avgResponseTime = answered.length ? Math.round(answered.reduce((a, b) => a + (b.responseTimeSeconds || 0), 0) / answered.length) : null;
    return {
      totalQuestions,
      unansweredQuestions: unanswered.length,
      unansweredPercent,
      avgResponseTimeSeconds: avgResponseTime,
    };
  }
}
