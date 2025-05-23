
import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KpiService } from './kpi.service';
import { KpiController } from './kpi.controller';
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
            durable: false
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
