import { Injectable } from '@nestjs/common';
import { UserEntity } from '../user-management/entities/user.entity';
import { UserCompanyAssignmentEntity } from '../company/entities/user-company-assignment.entity';
import { KpiEntity } from '../kpi/entities/kpi.entity';

@Injectable()
export class PayrollService {
  // Oklad + KPI + Qo'shimcha - Avans = Qo'lga tegadigan
  calculatePayroll(params: {
    user: UserEntity;
    assignment: UserCompanyAssignmentEntity;
    kpiScores: KpiEntity[];
    bonuses: number;
    advances: number;
    penalties?: number;
  }) {
    const baseSalary = params.user.baseSalary || 0;
    const salaryShare = (params.assignment.salaryPercentageFromCompany || 100) / 100;
    // KPI bonus calculation: sum weighted bonuses by definition
    let kpiBonus = 0;
    const kpiBreakdown: Record<string, { value: number; weight: number; bonus: number }> = {};
    if (params.kpiScores && params.kpiScores.length > 0) {
      for (const kpi of params.kpiScores) {
        // Each kpi should have kpiDefinition with weightInOverallKpi (as percent)
        const def = kpi.kpiDefinition;
        if (!def) continue;
        const weight = def.weightInOverallKpi || 0;
        const percent = Math.max(Math.min(kpi.value, 100), 0); // Clamp to 0-100
        const bonus = (baseSalary * weight * percent) / 10000; // (salary * weight% * percent)/100
        kpiBonus += bonus;
        kpiBreakdown[def.code || def.name] = {
          value: kpi.value,
          weight,
          bonus,
        };
      }
    }
    const total = baseSalary * salaryShare + kpiBonus + (params.bonuses || 0);
    const net = total - (params.advances || 0) - (params.penalties || 0);
    return {
      baseSalary,
      salaryShare,
      kpiBonus,
      kpiBreakdown,
      bonuses: params.bonuses,
      advances: params.advances,
      penalties: params.penalties || 0,
      total,
      net,
    };
  }
}
