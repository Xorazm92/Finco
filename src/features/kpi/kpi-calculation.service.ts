import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MessageLogEntity } from '../message-log/entities/message-log.entity';
import { ReportLogEntity } from '../kpi-report-submission/entities/report-log.entity';
import { UserEntity } from '../user-management/entities/user.entity';

@Injectable()
export class KpiCalculationService {
  constructor(
    @InjectRepository(MessageLogEntity)
    private readonly messageLogRepo: Repository<MessageLogEntity>,
    @InjectRepository(ReportLogEntity)
    private readonly reportLogRepo: Repository<ReportLogEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
  ) {}

  /**
   * Foydalanuvchi uchun KPI statistikalarini hisoblash
   */
  async getUserKpiStats(telegramId: string, periodDays = 30) {
    const now = new Date();
    const fromDate = new Date(now.getTime() - periodDays * 24 * 60 * 60 * 1000);

    // 1. Savollar va javoblar statistikasi
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

    // 2. Hisobotlar statistikasi
    const reports = await this.reportLogRepo.find({
      where: { submittedByUser: { telegramId } },
      relations: ['submittedByUser'],
    });
    const totalReports = reports.length;
    const lateReports = reports.filter(r => r.status === 'LATE');
    const lateReportsPercent = totalReports ? Math.round((lateReports.length / totalReports) * 100) : 0;

    return {
      totalQuestions,
      unansweredQuestions: unanswered.length,
      unansweredPercent,
      avgResponseTimeSeconds: avgResponseTime,
      totalReports,
      lateReports: lateReports.length,
      lateReportsPercent,
    };
  }
}
