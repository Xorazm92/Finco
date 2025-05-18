import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class AiQueueService {
  constructor(@InjectQueue('ai-tasks') private readonly aiQueue: Queue) {}

  async addSentimentJob(text: string) {
    return this.aiQueue.add('sentiment', { text });
  }

  async getJobResult(jobId: string) {
    const job = await this.aiQueue.getJob(jobId);
    if (!job) return { error: 'Job not found' };
    const state = await job.getState();
    const result = job.returnvalue;
    return {
      id: job.id,
      state,
      result,
      progress: job.progress,
      failedReason: job.failedReason,
      finishedOn: job.finishedOn,
      processedOn: job.processedOn,
    };
  }
}
