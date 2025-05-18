import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { HumanFeedbackService } from './human-feedback.service';

@Controller('human-feedback')
export class HumanFeedbackController {
  constructor(private readonly feedbackService: HumanFeedbackService) {}

  @Post('add')
  async addFeedback(@Body() dto: {
    aiAnalysisResultId: number;
    reviewerTelegramId?: string;
    verdict: 'approved' | 'rejected' | 'corrected';
    comment?: string;
  }) {
    if (!dto.aiAnalysisResultId || !dto.verdict) return { error: 'aiAnalysisResultId and verdict required' };
    return this.feedbackService.addFeedback(dto);
  }

  @Get('by-result')
  async byResult(@Query('aiAnalysisResultId') aiAnalysisResultId: number) {
    return this.feedbackService.findByResultId(Number(aiAnalysisResultId));
  }

  @Get('latest')
  async latest(@Query('limit') limit = 20) {
    return this.feedbackService.findLatest(Number(limit));
  }
}
