
import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ReportManagementService } from './report-management.service';
import { KpiCalculationModule } from '../kpi-calculation/kpi-calculation.module';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'REPORT_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://localhost:5672'],
          queue: 'report_queue',
          queueOptions: {
            durable: true
          },
        },
      },
    ]),
    KpiCalculationModule,
  ],
  providers: [ReportManagementService],
  exports: [ReportManagementService],
})
export class ReportManagementModule {}
