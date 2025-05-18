import { Controller, Get, Query } from '@nestjs/common';
import { AiTaskCoordinatorService } from './ai-task-coordinator.service';

@Controller('ai-test')
export class AiTestController {
  constructor(private readonly aiTaskCoordinator: AiTaskCoordinatorService) {}

  @Get('sentiment')
  async testSentiment(@Query('text') text: string) {
    if (!text) return { error: 'text query param required' };
    const result = await this.aiTaskCoordinator.analyzeSentiment(text);
    return { input: text, result };
  }
}
