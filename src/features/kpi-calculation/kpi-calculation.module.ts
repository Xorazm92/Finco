
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { KpiCalculationService } from './kpi-calculation.service';
import { KpiScoreEntity } from './entities/kpi-score.entity';
import { MessageLogEntity } from '../message-log/entities/message-log.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([KpiScoreEntity, MessageLogEntity]),
    BullModule.registerQueue({
      name: 'kpi-calculation',
    }),
  ],
  providers: [KpiCalculationService],
  exports: [KpiCalculationService],
})
export class KpiCalculationModule {}
