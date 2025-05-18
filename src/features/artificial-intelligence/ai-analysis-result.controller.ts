import { Controller, Get, Query, Param } from '@nestjs/common';
import { AiAnalysisResultService } from './ai-analysis-result.service';

@Controller('ai-analysis-result')
export class AiAnalysisResultController {
  constructor(private readonly resultService: AiAnalysisResultService) {}

  @Get('latest')
  async latest(@Query('type') type?: string, @Query('limit') limit = 20) {
    return this.resultService.findLatest(type, Number(limit));
  }

  @Get(':id')
  async byId(@Param('id') id: number) {
    return this.resultService.findById(id);
  }
}
