import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { AiQueueService } from './ai-queue.service';

@ApiTags('AI Queue')
@Controller('ai-queue')
export class AiQueueController {
  constructor(private readonly aiQueueService: AiQueueService) {}

  @Post('sentiment')
  @ApiOperation({ summary: 'Queue a sentiment analysis job' })
  @ApiBody({
    schema: {
      example: { text: 'Bu xabarni analiz qiling.' },
      properties: { text: { type: 'string', example: 'Bu xabarni analiz qiling.' } }
    }
  })
  @ApiResponse({ status: 201, description: 'Job queued' })
  async queueSentiment(@Body('text') text: string) {
    if (!text) return { error: 'text body param required' };
    const job = await this.aiQueueService.addSentimentJob(text);
    const status = await job.getState();
    return { jobId: job.id, status }; // status will be 'waiting' or 'active'
  }

  @Get('result/:jobId')
  @ApiOperation({ summary: 'Get result of sentiment analysis job' })
  @ApiParam({ name: 'jobId', type: String })
  @ApiResponse({ status: 200, description: 'Job result' })
  async getSentimentResult(@Param('jobId') jobId: string) {
    return this.aiQueueService.getJobResult(jobId);
  }
}

