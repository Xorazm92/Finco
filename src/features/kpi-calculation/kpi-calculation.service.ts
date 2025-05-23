import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { KpiScoreEntity } from './entities/kpi-score.entity';
import { MessageLogEntity } from '../message-log/entities/message-log.entity';
import { KpiDefinitionEntity } from '../kpi/entities/kpi-definition.entity';

@Injectable()
export class KpiCalculationService {
  constructor(
    @InjectRepository(KpiScoreEntity)
    private readonly kpiScoreRepo: Repository<KpiScoreEntity>,
    @InjectRepository(MessageLogEntity)
    private readonly messageLogRepo: Repository<MessageLogEntity>,
    @InjectRepository(KpiDefinitionEntity)
    private readonly kpiDefRepo: Repository<KpiDefinitionEntity>,
  ) {}

  async calculateResponseTimeKpi(
    userId: number,
    period: { start: Date; end: Date },
  ): Promise<number> {
    const messages = await this.messageLogRepo.find({
      where: {
        userId: userId,
      },
      relations: ['user']
    });

    const responseTimes = messages
      .filter((m) => m.responseTimeSeconds !== null)
      .map((m) => m.responseTimeSeconds || 0);

    if (!responseTimes.length) {
      return 0;
    }

    return responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
  }

  async calculateQualityKpi(
    userId: number,
    period: { start: Date; end: Date },
  ): Promise<number> {
    const messages = await this.messageLogRepo.find({
      where: {
        senderId: userId,
        createdAt: Between(period.start, period.end),
      },
      relations: ['feedback'],
    });

    let totalFeedback = 0;
    let positiveFeedback = 0;

    messages.forEach(msg => {
      if (msg.feedback) {
        totalFeedback++;
        if (msg.feedback.sentiment === 'POSITIVE') {
          positiveFeedback++;
        }
      }
    });

    return totalFeedback > 0 ? (positiveFeedback / totalFeedback) * 100 : 0;
  }

  async saveKpiScore(data: Partial<KpiScoreEntity>): Promise<KpiScoreEntity> {
    const score = this.kpiScoreRepo.create(data);
    return this.kpiScoreRepo.save(score);
  }

  async getKpiScores(userId: number, period: { start: Date; end: Date }) {
    return this.kpiScoreRepo.find({
      where: {
        userId,
        scoringPeriod: Between(period.start, period.end),
      },
      relations: ['kpiDefinition'],
    });
  }
}