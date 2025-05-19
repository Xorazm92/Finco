import { Controller, Get, Param, Query } from '@nestjs/common';
import { KpiCalculationService } from './kpi-calculation.service';

@Controller('kpi')
export class KpiController {
  constructor(private readonly kpiService: KpiCalculationService) {}

  // GET /kpi/user/:telegramId?days=30
  @Get('user/:telegramId')
  async getUserKpi(@Param('telegramId') telegramId: string, @Query('days') days?: string) {
    const periodDays = days ? parseInt(days, 10) : 30;
    return this.kpiService.getUserKpiStats(telegramId, periodDays);
  }

  // GET /kpi/group/:chatId?days=30
  @Get('group/:chatId')
  async getGroupKpi(@Param('chatId') chatId: string, @Query('days') days?: string) {
    const periodDays = days ? parseInt(days, 10) : 30;
    return this.kpiService.getGroupKpiStats(chatId, periodDays);
  }

  // GET /kpi/summary?days=30
  @Get('summary')
  async getSummaryKpi(@Query('days') days?: string) {
    const periodDays = days ? parseInt(days, 10) : 30;
    return this.kpiService.getSummaryKpiStats(periodDays);
  }
}
