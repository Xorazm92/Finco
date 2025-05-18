import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { AiQueueService } from './ai-queue.service';

@Controller('ai-queue')
export class AiQueueController {
  constructor(private readonly aiQueueService: AiQueueService) {}

  @Post('sentiment')
  async queueSentiment(@Body('text') text: string) {
    if (!text) return { error: 'text body param required' };
    const job = await this.aiQueueService.addSentimentJob(text);
    const status = await job.getState();
    return { jobId: job.id, status }; // status will be 'waiting' or 'active'
  }

  @Get('result/:jobId')
  async getSentimentResult(@Param('jobId') jobId: string) {
    return this.aiQueueService.getJobResult(jobId);
  }
}

