import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KpiScoreEntity } from './entities/kpi-score.entity';
import { UserEntity } from '../user-management/entities/user.entity';
import { KpiCalculationService } from './kpi-calculation.service';

import { MessageLogEntity } from '../message-log/entities/message-log.entity';

import { ReportSubmissionModule } from '../kpi-report-submission/report-submission.module';
import { ReportLogEntity } from '../kpi-report-submission/entities/report-log.entity';
import { AttendanceLogEntity } from '../attendance-log/entities/attendance-log.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      KpiScoreEntity,
      UserEntity,
      MessageLogEntity,
      ReportLogEntity,
      AttendanceLogEntity,
    ]),
    ReportSubmissionModule,
  ],
  providers: [KpiCalculationService],
  exports: [KpiCalculationService],
})
export class KpiCalculationModule {}
