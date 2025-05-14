import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { KpiScoreEntity } from './entities/kpi-score.entity';
import { UserEntity } from '../user-management/entities/user.entity';

@Injectable()
export class KpiCalculationService {
  constructor(
    @InjectRepository(KpiScoreEntity)
    private readonly kpiScoreRepo: Repository<KpiScoreEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
  ) {}

  async calculateKpiForUser(userId: number) {
    // KPI hisoblash logikasi (mock)
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) return;
    const score = this.kpiScoreRepo.create({
      user,
      kpiMetricCode: 'AVG_RESPONSE_TIME',
      scoreValue: Math.random() * 100, // demo uchun random
      periodStartDate: new Date(),
      periodEndDate: new Date(),
      calculatedAt: new Date(),
    });
    await this.kpiScoreRepo.save(score);
    return score;
  }
}
