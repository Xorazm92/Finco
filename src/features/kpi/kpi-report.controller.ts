import { Controller, Get, Query } from '@nestjs/common';
import { KpiReportService } from './kpi-report.service';

@Controller('api/kpi')
export class KpiReportController {
  constructor(private readonly kpiReportService: KpiReportService) {}

  @Get('dashboard')
  async getDashboardStats(@Query('chatId') chatId: string) {
    return this.kpiReportService.getDashboardStats(chatId);
  }

  @Get('trend')
  async getKpiTrend(@Query('chatId') chatId: string, @Query('weeks') weeks = 4) {
    return this.kpiReportService.getWeeklyKpiTrend(Number(chatId), Number(weeks));
  }
}
