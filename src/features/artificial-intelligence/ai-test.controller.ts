import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { AiTaskCoordinatorService } from './ai-task-coordinator.service';

@ApiTags('AI Test')
@Controller('ai-test')
export class AiTestController {
  constructor(private readonly aiTaskCoordinator: AiTaskCoordinatorService) {}

  @Get('sentiment')
  @ApiOperation({ summary: 'Test sentiment analysis' })
  @ApiQuery({ name: 'text', required: true, type: String })
  @ApiResponse({ status: 200, description: 'Sentiment analysis result' })
  async testSentiment(@Query('text') text: string) {
    if (!text) return { error: 'text query param required' };
    const result = await this.aiTaskCoordinator.analyzeSentiment(text);
    return { input: text, result };
  }
}
