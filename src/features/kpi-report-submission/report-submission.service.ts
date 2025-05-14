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
    // ...hisobotni saqlash va status aniqlash logikasi (soddalashtirilgan)
    // payload: {reportCode, telegramMessage, submittedByTelegramId, chatId, ctx}
    const user = await this.userRepo.findOne({
      where: { telegramId: String(payload.submittedByTelegramId) },
    });
    if (!user) return;
    const reportType = await this.reportTypeRepo.findOne({
      where: { code: payload.reportCode },
    });
    if (!reportType) return;
    // Muddat va status hisoblash (mock)
    const deadlineAt = new Date();
    const submittedAt = new Date();
    const status = ReportStatus.PENDING;
    const report = this.reportLogRepo.create({
      reportType,
      telegramChatId: String(payload.chatId),
      submittedByUser: user,
      submittedAt,
      fileTelegramId: payload.telegramMessage.document.file_id,
      fileName: payload.telegramMessage.document.file_name,
      periodStartDate: new Date(),
      periodEndDate: new Date(),
      deadlineAt,
      status,
    });
    await this.reportLogRepo.save(report);
  }
}
