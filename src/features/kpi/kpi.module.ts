
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { KpiController } from './kpi.controller';
import { KpiService } from './kpi.service';
import { KpiScoreEntity } from './entities/kpi-score.entity';
import { MessageLogEntity } from '../message-log/entities/message-log.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([KpiScoreEntity, MessageLogEntity]),
    ClientsModule.register([
      {
        name: 'KPI_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://localhost:5672'],
          queue: 'kpi_queue',
          queueOptions: {
            durable: true
          },
        },
      },
    ]),
  ],
  controllers: [KpiController],
  providers: [KpiService],
  exports: [KpiService],
})
export class KpiModule {}
