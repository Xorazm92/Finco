
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportManagementService } from './report-management.service';
import { ReportEntity } from './entities/report.entity';
import { KpiCalculationModule } from '../kpi-calculation/kpi-calculation.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ReportEntity]),
    KpiCalculationModule,
  ],
  providers: [ReportManagementService],
  exports: [ReportManagementService],
})
export class ReportManagementModule {}
