import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientProxy } from '@nestjs/microservices';
import { KpiScoreEntity } from './entities/kpi-score.entity';
import { MessageLogEntity } from '../message-log/entities/message-log.entity';

@Injectable()
export class KpiService {
  constructor(
    @InjectRepository(KpiScoreEntity)
    private readonly kpiRepo: Repository<KpiScoreEntity>,
    @InjectRepository(MessageLogEntity)
    private readonly messageLogRepo: Repository<MessageLogEntity>,
    @Inject('KPI_SERVICE') private readonly kpiClient: ClientProxy,
  ) {}

  async calculateKpi(userId: string, period: { start: Date; end: Date }) {
    return this.kpiClient.send({ cmd: 'calculate_kpi' }, { userId, period }).toPromise();
  }

  async getKpiStats(telegramId: string, periodDays = 30) {
    return this.kpiClient.send({ cmd: 'get_kpi_stats' }, { telegramId, periodDays }).toPromise();
  }
}