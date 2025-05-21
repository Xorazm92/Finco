import { Injectable } from '@nestjs/common';
import { KpiService } from './kpi.service';

@Injectable()
export class KpiAnalyticsService {
  constructor(private readonly kpiService: KpiService) {}

  async getUserStats(userId: number) {
    const kpis = await this.kpiService.findByUser(userId);
    if (!kpis.length) return null;

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const weekKpi = kpis.filter((k) => k.createdAt >= weekAgo);
    const monthKpi = kpis.filter((k) => k.createdAt >= monthAgo);

    const avg = (arr: typeof kpis) =>
      arr.length ? arr.reduce((a, b) => a + b.value, 0) / arr.length : null;
    const max = (arr: typeof kpis) =>
      arr.length ? Math.max(...arr.map((k) => k.value)) : null;
    const min = (arr: typeof kpis) =>
      arr.length ? Math.min(...arr.map((k) => k.value)) : null;

    // Trend: oxirgi 2 KPI ni solishtirish
    let trend = null;
    if (kpis.length >= 2) {
      const last = kpis[0].value;
      const prev = kpis[1].value;
      trend = last > prev ? 'O‘sish' : last < prev ? 'Pasayish' : 'O‘zgarmadi';
    }

    return {
      weekAvg: avg(weekKpi),
      monthAvg: avg(monthKpi),
      max: max(kpis),
      min: min(kpis),
      trend,
      count: kpis.length,
    };
  }
}
