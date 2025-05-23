
import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { MessageProcessorService } from './message-processor.service';

@Processor('message-processing')
export class MessageProcessorConsumer {
  constructor(private messageProcessorService: MessageProcessorService) {}

  @Process('process-message')
  async processMessage(job: Job) {
    const { message, chat, from } = job.data;
    await this.messageProcessorService.processMessage(message, chat, from);
  }
}
