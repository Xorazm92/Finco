import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReportLogEntity } from './entities/report-log.entity';
import { ReportTypeEntity } from './entities/report-type.entity';
import { UserEntity } from '../user-management/entities/user.entity';
import { ReportStatus } from '../../shared/enums/report-status.enum';

@Injectable()
export class ReportSubmissionService {
  constructor(
    @InjectRepository(ReportLogEntity)
    private readonly reportLogRepo: Repository<ReportLogEntity>,
    @InjectRepository(ReportTypeEntity)
    private readonly reportTypeRepo: Repository<ReportTypeEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
  ) {}

  async processReport(payload: any) {
    // payload: {reportCode, telegramMessage, submittedByTelegramId, chatId, ctx}
    const user = await this.userRepo.findOne({
      where: { telegramId: String(payload.submittedByTelegramId) },
    });
    if (!user) return;
    const reportType = await this.reportTypeRepo.findOne({
      where: { code: payload.reportCode },
    });
    if (!reportType) return;

    // deadline hisoblash (reportType.deadlineMinutes asosida)
    const now = new Date();
    let deadlineAt: Date | undefined = undefined;
    if (reportType.deadlineMinutes) {
      deadlineAt = new Date(now.getTime() + reportType.deadlineMinutes * 60 * 1000);
    }

    // period aniqlash (masalan, har kuni yoki haftalik bo‘lsa, hozircha mock)
    const periodStartDate = now; // TODO: haqiqiy periodga moslashtirish
    const periodEndDate = now;   // TODO: haqiqiy periodga moslashtirish

    // status hisoblash
    let status = ReportStatus.PENDING;
    if (deadlineAt && now > deadlineAt) {
      status = ReportStatus.LATE;
    }

    const report = this.reportLogRepo.create({
      reportType,
      telegramChatId: String(payload.chatId),
      submittedByUser: user,
      submittedAt: now,
      fileTelegramId: payload.telegramMessage.document?.file_id,
      fileName: payload.telegramMessage.document?.file_name,
      periodStartDate,
      periodEndDate,
      deadlineAt,
      status,
    });
    await this.reportLogRepo.save(report);

    // TODO: deadline yaqinlashganda/otganda mas’ullarga eslatma yuborish (scheduler)
  }
}
