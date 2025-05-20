import { Module, forwardRef } from '@nestjs/common';
import { PayrollReportController } from './payroll-report.controller';
import { PayrollService } from './payroll.service';
import { UserService } from '../user-management/user.service';
import { UserCompanyAssignmentService } from '../company/user-company-assignment.service';
import { KpiCalculationService } from '../kpi/kpi-calculation.service';

@Module({
  controllers: [PayrollReportController],
  providers: [PayrollService, UserService, UserCompanyAssignmentService, KpiCalculationService],
  exports: [PayrollReportController],
})
export class PayrollReportModule {}
