import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessageLogEntity } from '../message-log/entities/message-log.entity';
import { KpiReportService } from './kpi-report.service';
import { KpiReportController } from './kpi-report.controller';

@Module({
  imports: [TypeOrmModule.forFeature([MessageLogEntity])],
  providers: [KpiReportService],
  controllers: [KpiReportController],
  exports: [KpiReportService],
})
export class KpiReportModule {}
