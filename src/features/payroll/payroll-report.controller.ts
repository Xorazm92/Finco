import { Controller, Get, Query } from '@nestjs/common';
import { PayrollService } from './payroll.service';
import { UserService } from '../user-management/user.service';
import { UserCompanyAssignmentService } from '../company/user-company-assignment.service';
import { KpiCalculationService } from '../kpi/kpi-calculation.service';
import { BonusService } from './bonus.service';
import { AdvanceService } from './advance.service';
import { PenaltyService } from './penalty.service';

@Controller('payroll/report')
export class PayrollReportController {
  constructor(
    private readonly payrollService: PayrollService,
    private readonly userService: UserService,
    private readonly assignmentService: UserCompanyAssignmentService,
    private readonly kpiCalculationService: KpiCalculationService,
    private readonly bonusService: BonusService,
    private readonly advanceService: AdvanceService,
    private readonly penaltyService: PenaltyService,
  ) {}

  // GET /payroll/report?userId=1&companyId=1&period=2025-05
  @Get()
  async getPayrollReport(
    @Query('userId') userId: number,
    @Query('companyId') companyId: number,
    @Query('period') period: string,
  ) {
    const user = await this.userService.findById(userId);
    if (!user) throw new Error('User not found');
    const assignment = await this.assignmentService.findByUserAndCompany(userId, companyId);
    if (!assignment) throw new Error('Assignment not found for user and company');
    const kpiScores = await this.kpiCalculationService.getUserKpiScoresForPeriod(userId, companyId, period);
    const bonusesArr = await this.bonusService.findByUserAndCompany(userId, companyId);
    const advancesArr = await this.advanceService.findByUserAndCompany(userId, companyId);
    const penaltiesArr = await this.penaltyService.findByUserAndCompany(userId, companyId);
    const bonuses = bonusesArr.reduce((sum: number, b: any) => sum + (b.amount || 0), 0);
    const advances = advancesArr.reduce((sum: number, a: any) => sum + (a.amount || 0), 0);
    const penalties = penaltiesArr.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
    return this.payrollService.calculatePayroll({
      user,
      assignment,
      kpiScores,
      bonuses,
      advances,
      penalties,
    });
  }
}
