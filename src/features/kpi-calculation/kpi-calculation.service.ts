import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { KpiScoreEntity } from './entities/kpi-score.entity';
import { UserEntity } from '../user-management/entities/user.entity';
import { MessageLogEntity } from '../message-log/entities/message-log.entity';

@Injectable()
export class KpiCalculationService {
  constructor(
    @InjectRepository(KpiScoreEntity)
    private readonly kpiScoreRepo: Repository<KpiScoreEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(MessageLogEntity)
    private readonly messageLogRepo: Repository<MessageLogEntity>,
    @InjectRepository(require('../kpi-report-submission/entities/report-log.entity').ReportLogEntity)
    private readonly reportLogRepo: Repository<any>,
    @InjectRepository(require('../attendance-log/entities/attendance-log.entity').AttendanceLogEntity)
    private readonly attendanceLogRepo: Repository<any>,
  ) {}

  /**
   * Foydalanuvchi uchun ishga kelish KPI'larini hisoblaydi va saqlaydi.
   * - 08:30 dan oldin kelgan kunlar foizi (ish kunlari uchun)
   * @param userId
   * @param periodStart
   * @param periodEnd
   */
  async calculateAttendanceKpisForUser(userId: number, periodStart: Date, periodEnd: Date) {
    // AttendanceLogEntity import
    const logs = await this.attendanceLogRepo.find({
      where: {
        user: { id: userId },
        checkinAt: { $gte: periodStart, $lte: periodEnd } as any,
      },
      relations: ['user'],
    });
    if (!logs.length) return;
    // On time = 08:30 dan oldin check-in qilganlar
    const onTime = logs.filter((l: any) => {
      const d = new Date(l.checkinAt);
      return d.getHours() < 8 || (d.getHours() === 8 && d.getMinutes() <= 30);
    }).length;
    const percentOnTime = Math.round((onTime / logs.length) * 100);
    // KPI'ni KpiScoreEntity'ga yozish
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) return;
    const attendanceScore = this.kpiScoreRepo.create({
      user,
      kpiMetricCode: 'ATTENDANCE_ON_TIME_PERCENT',
      scoreValue: percentOnTime,
      periodStartDate: periodStart,
      periodEndDate: periodEnd,
      calculatedAt: new Date(),
    });
    await this.kpiScoreRepo.save(attendanceScore);
    // Audit log
    if (typeof (this as any).auditLogService?.logAction === 'function') {
      await (this as any).auditLogService.logAction(
        'KPI_CALCULATED',
        String(userId),
        String(userId),
        {
          metric: 'ATTENDANCE_ON_TIME_PERCENT',
          value: percentOnTime,
          period: { start: periodStart, end: periodEnd }
        }
      );
    }
    return { percentOnTime };
  }

  /**
   * Foydalanuvchi uchun hisobot topshirish KPI'larini hisoblaydi va saqlaydi.
   * - O'z vaqtida topshirilgan hisobotlar foizi
   * @param userId
   * @param periodStart
   * @param periodEnd
   */
  async calculateReportSubmissionKpisForUser(userId: number, periodStart: Date, periodEnd: Date) {
    // ReportStatus import
    const { ReportStatus } = require('../../shared/enums/report-status.enum');
    const submitted = await this.reportLogRepo.find({
      where: {
        submittedByUser: { id: userId },
        submittedAt: { $gte: periodStart, $lte: periodEnd } as any,
      },
      relations: ['submittedByUser'],
    });
    if (!submitted.length) return;
    const onTime = submitted.filter((r: any) =>
      (r.status === ReportStatus.APPROVED || r.status === ReportStatus.PENDING) &&
      (!r.deadlineAt || r.submittedAt <= r.deadlineAt)
    ).length;
    const percentOnTime = Math.round((onTime / submitted.length) * 100);
    // KPI'ni KpiScoreEntity'ga yozish
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) return;
    const reportScore = this.kpiScoreRepo.create({
      user,
      kpiMetricCode: 'REPORTS_ON_TIME_PERCENT',
      scoreValue: percentOnTime,
      periodStartDate: periodStart,
      periodEndDate: periodEnd,
      calculatedAt: new Date(),
    });
    await this.kpiScoreRepo.save(reportScore);
    // Audit log
    if (typeof (this as any).auditLogService?.logAction === 'function') {
      await (this as any).auditLogService.logAction(
        'KPI_CALCULATED',
        String(userId),
        String(userId),
        {
          metric: 'REPORTS_ON_TIME_PERCENT',
          value: percentOnTime,
          period: { start: periodStart, end: periodEnd }
        }
      );
    }
    return { percentOnTime };
  }

  /**
   * Foydalanuvchi uchun javob vaqti KPI'larini hisoblaydi va saqlaydi.
   * - 10 daqiqada javob berilgan savollar foizi
   * - O'rtacha javob vaqti (sekundlarda)
   * @param userId
   * @param periodStart
   * @param periodEnd
   */
  async calculateResponseTimeKpisForUser(userId: number, periodStart: Date, periodEnd: Date) {
    const user = await this.userRepo.findOne({ 
      where: { id: userId },
      relations: ['messageLog', 'reportLog', 'attendanceLog']
    });
    
    if (!user) {
      throw new NotFoundException('Foydalanuvchi topilmadi');
    }
    if (!user) return;

    // MessageLogEntity repository ni inject qilamiz
    const answered = await this.messageLogRepo.find({
      where: {
        
        questionStatus: "ANSWERED",
        
      },
      relations: ['senderUser', 'replyByUser'],
    });
    if (!answered.length) return;

    // O'rtacha javob vaqti
    const avgResponseTime =
      answered.reduce((acc: number, q: any) => acc + (q.responseTimeSeconds || 0), 0) / answered.length;
    // 10 daqiqada javob berilganlar foizi
    const answeredIn10Min = answered.filter((q: any) => (q.responseTimeSeconds || 0) <= 600).length;
    const percentIn10Min = Math.round((answeredIn10Min / answered.length) * 100);

    // KPI'larni KpiScoreEntity'ga yozish
    const avgRespScore = this.kpiScoreRepo.create({
      user,
      kpiMetricCode: 'AVG_RESPONSE_TIME',
      scoreValue: avgResponseTime,
      periodStartDate: periodStart,
      periodEndDate: periodEnd,
      calculatedAt: new Date(),
    });
    const percent10MinScore = this.kpiScoreRepo.create({
      user,
      kpiMetricCode: 'PERCENT_RESPONSE_UNDER_10MIN',
      scoreValue: percentIn10Min,
      periodStartDate: periodStart,
      periodEndDate: periodEnd,
      calculatedAt: new Date(),
    });
    await this.kpiScoreRepo.save(avgRespScore);
    await this.kpiScoreRepo.save(percent10MinScore);
    // Audit log
    if (typeof (this as any).auditLogService?.logAction === 'function') {
      await (this as any).auditLogService.logAction(
        'KPI_CALCULATED',
        String(userId),
        String(userId),
        {
          metric: 'AVG_RESPONSE_TIME',
          value: avgResponseTime,
          period: { start: periodStart, end: periodEnd }
        }
      );
      await (this as any).auditLogService.logAction(
        'KPI_CALCULATED',
        String(userId),
        String(userId),
        {
          metric: 'PERCENT_RESPONSE_UNDER_10MIN',
          value: percentIn10Min,
          period: { start: periodStart, end: periodEnd }
        }
      );
    }
    return { avgResponseTime, percentIn10Min };
  }

  /**
   * Barcha xodimlar uchun KPI'larni hisoblash (kunlik yoki haftalik)
   * @param periodStart
   * @param periodEnd
   */
  async calculateAllUsersResponseTimeKpis(periodStart: Date, periodEnd: Date) {
    const users = await this.userRepo.find();
    for (const user of users) {
      await this.calculateResponseTimeKpisForUser(user.id, periodStart, periodEnd);
    }
  }

  /**
   * Foydalanuvchi uchun so'nggi KPI natijalarini qaytaradi
   * @param userId
   * @param limit
   */
  async getLatestKpiScoresForUser(userId: number, limit = 2) {
    return this.kpiScoreRepo.find({
      where: { user: { id: userId } },
      order: { calculatedAt: 'DESC' },
      take: limit,
    });
  }
}
