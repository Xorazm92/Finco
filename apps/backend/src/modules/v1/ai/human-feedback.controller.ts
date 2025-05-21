import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiQuery } from '@nestjs/swagger';
import { HumanFeedbackService } from './human-feedback.service';

@ApiTags('Human Feedback')
@Controller('human-feedback')
export class HumanFeedbackController {
  constructor(private readonly feedbackService: HumanFeedbackService) {}

  @Post('add')
  @ApiOperation({ summary: 'Add human feedback for AI analysis result' })
  @ApiBody({
    schema: {
      example: {
        aiAnalysisResultId: 1,
        reviewerTelegramId: '123456789',
        verdict: 'approved',
        comment: 'AI natijasi to‘g‘ri.'
      },
      properties: {
        aiAnalysisResultId: { type: 'number', example: 1 },
        reviewerTelegramId: { type: 'string', example: '123456789' },
        verdict: { type: 'string', enum: ['approved', 'rejected', 'corrected'], example: 'approved' },
        comment: { type: 'string', example: "AI natijasi to‘g‘ri." }
      },
      required: ['aiAnalysisResultId', 'verdict']
    }
  })
  @ApiResponse({ status: 201, description: 'Feedback added' })
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
  @ApiOperation({ summary: 'Get feedback by AI analysis result id' })
  @ApiQuery({ name: 'aiAnalysisResultId', required: true, type: Number })
  @ApiResponse({ status: 200, description: 'Feedback for result' })
  async byResult(@Query('aiAnalysisResultId') aiAnalysisResultId: number) {
    return this.feedbackService.findByResultId(Number(aiAnalysisResultId));
  }

  @Get('latest')
  @ApiOperation({ summary: 'Get latest feedback' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Latest feedback' })
  async latest(@Query('limit') limit = 20) {
    return this.feedbackService.findLatest(Number(limit));
  }
}
