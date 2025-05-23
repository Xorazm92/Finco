
import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { BullModule } from '@nestjs/bull';
import { MessageProcessorService } from './message-processor.service';
import { MessageProcessorConsumer } from './message-processor.consumer';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'message-processing',
    }),
    ClientsModule.register([
      {
        name: 'MESSAGE_PROCESSOR',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://localhost:5672'],
          queue: 'message_queue',
          queueOptions: {
            durable: false
          },
        },
      },
    ]),
  ],
  providers: [MessageProcessorService, MessageProcessorConsumer],
})
export class MessageProcessorModule {}
