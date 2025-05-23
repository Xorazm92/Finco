
import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AiService } from './ai.service';
import { LlmClientService } from './llm-client.service';
import { PromptEngineeringService } from './prompt-engineering.service';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'AI_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://0.0.0.0:5672'],
          queue: 'ai_queue',
          queueOptions: {
            durable: false
          },
        },
      },
    ]),
  ],
  providers: [AiService, LlmClientService, PromptEngineeringService],
  exports: [AiService],
})
export class AiModule {}
