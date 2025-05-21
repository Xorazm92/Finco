import { Module, forwardRef } from '@nestjs/common';
import { PayrollReportModule } from './payroll-report.module';
import { BonusController } from './bonus.controller';
import { AdvanceController } from './advance.controller';
import { PenaltyController } from './penalty.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PayrollService } from './payroll.service';
import { PayrollController } from './payroll.controller';
import { PayrollAuditLogService } from './payroll-audit-log.service';
import { AuditLogEntity } from '../kpi/entities/audit-log.entity';
import { BonusEntity } from './entities/bonus.entity';
import { AdvanceEntity } from './entities/advance.entity';
import { PenaltyEntity } from './entities/penalty.entity';
import { PayrollAuditLogEntity } from './entities/payroll-audit-log.entity';
import { BonusService } from './bonus.service';
import { AdvanceService } from './advance.service';
import { PenaltyService } from './penalty.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BonusEntity,
      AdvanceEntity,
      PenaltyEntity,
      PayrollAuditLogEntity,
    ]),
    forwardRef(() => PayrollReportModule),
  ],
  providers: [
    PayrollService,
    BonusService,
    AdvanceService,
    PenaltyService,
    PayrollAuditLogService,
  ],
  controllers: [
    PayrollController,
    BonusController,
    AdvanceController,
    PenaltyController,
  ],
  exports: [
    PayrollService,
    BonusService,
    AdvanceService,
    PenaltyService,
    PayrollAuditLogService,
    PayrollReportModule,
  ],
})
export class PayrollModule {}
