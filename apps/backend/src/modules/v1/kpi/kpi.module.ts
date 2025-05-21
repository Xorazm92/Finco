import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KpiEntity } from './entities/kpi.entity';
import { AuditLogEntity } from './entities/audit-log.entity';
import { KpiService } from './kpi.service';
import { KpiAnalyticsService } from './kpi-analytics.service';
import { AuditLogService } from './audit-log.service';

@Module({
  imports: [TypeOrmModule.forFeature([KpiEntity, AuditLogEntity])],
  providers: [KpiService, KpiAnalyticsService, AuditLogService],
  exports: [KpiService, KpiAnalyticsService, AuditLogService],
})
export class KpiModule {}
