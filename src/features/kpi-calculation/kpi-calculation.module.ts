import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KpiScoreEntity } from './entities/kpi-score.entity';
import { UserEntity } from '../user-management/entities/user.entity';
import { KpiCalculationService } from './kpi-calculation.service';

@Module({
  imports: [TypeOrmModule.forFeature([KpiScoreEntity, UserEntity])],
  providers: [KpiCalculationService],
  exports: [KpiCalculationService],
})
export class KpiCalculationModule {}
