
import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MessageProcessorConsumer } from './message-processor.consumer';
import { AiModule } from '../artificial-intelligence/ai.module';
import { UserModule } from '../user-management/user.module';

@Module({
  imports: [
    AiModule,
    UserModule,
    ClientsModule.register([
      {
        name: 'MESSAGE_PROCESSOR',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://0.0.0.0:5672'],
          queue: 'message_queue',
          queueOptions: {
            durable: false
          },
        },
      },
    ]),
  ],
  providers: [MessageProcessorConsumer],
})
export class MessageProcessorModule {}
