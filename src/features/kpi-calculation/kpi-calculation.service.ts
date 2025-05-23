import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { KpiScoreEntity } from './entities/kpi-score.entity';
import { MessageLogEntity } from '../message-log/entities/message-log.entity';

@Injectable()
export class KpiCalculationService {
  private readonly logger = new Logger(KpiCalculationService.name);

  constructor(
    @InjectRepository(KpiScoreEntity)
    private readonly kpiScoreRepo: Repository<KpiScoreEntity>,
    @InjectRepository(MessageLogEntity)
    private readonly messageLogRepo: Repository<MessageLogEntity>,
    @InjectQueue('kpi-calculation') private readonly kpiQueue: Queue
  ) {}

  async calculateUserKpi(userId: string, period: { start: Date; end: Date }) {
    const messages = await this.messageLogRepo.find({
      where: {
        senderTelegramId: userId,
        sentAt: {
          $gte: period.start,
          $lte: period.end
        }
      }
    });

    const totalMessages = messages.length;
    const responseTimeAvg = this.calculateAverageResponseTime(messages);
    const qualityScore = await this.calculateQualityScore(messages);

    const kpiScore = new KpiScoreEntity();
    kpiScore.userId = userId;
    kpiScore.period = period;
    kpiScore.totalMessages = totalMessages;
    kpiScore.responseTimeScore = responseTimeAvg;
    kpiScore.qualityScore = qualityScore;
    kpiScore.finalScore = this.calculateFinalScore(responseTimeAvg, qualityScore);

    return this.kpiScoreRepo.save(kpiScore);
  }

  private calculateAverageResponseTime(messages: MessageLogEntity[]): number {
    const responseTimes = messages
      .filter(m => m.responseTimeSeconds)
      .map(m => m.responseTimeSeconds);

    if (responseTimes.length === 0) return 0;
    return responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
  }

  private async calculateQualityScore(messages: MessageLogEntity[]): Promise<number> {
    const qualityFactors = messages.map(m => ({
      isAnswered: m.questionStatus === 'ANSWERED' ? 1 : 0,
      hasPositiveFeedback: m.userFeedback === 'POSITIVE' ? 1 : 0
    }));

    const totalScore = qualityFactors.reduce((score, factor) => {
      return score + factor.isAnswered + factor.hasPositiveFeedback;
    }, 0);

    return totalScore / (messages.length * 2) * 100;
  }

  private calculateFinalScore(responseTimeScore: number, qualityScore: number): number {
    // Весовые коэффициенты
    const responseTimeWeight = 0.4;
    const qualityWeight = 0.6;

    return (responseTimeScore * responseTimeWeight) + (qualityScore * qualityWeight);
  }
}