import { Controller, Get, Query, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam } from '@nestjs/swagger';
import { AiAnalysisResultService } from './ai-analysis-result.service';

@ApiTags('AI Analysis Result')
@Controller('ai-analysis-result')
export class AiAnalysisResultController {
  constructor(private readonly resultService: AiAnalysisResultService) {}

  @Get('latest')
  @ApiOperation({ summary: 'Get latest AI analysis results' })
  @ApiQuery({ name: 'type', required: false, type: String })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Limit number of results' })
  @ApiResponse({ status: 200, description: 'Latest AI analysis results' })
  async latest(@Query('type') type?: string, @Query('limit') limit = 20) {
    return this.resultService.findLatest(type, Number(limit));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get AI analysis result by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'AI analysis result found' })
  async byId(@Param('id') id: number) {
    return this.resultService.findById(id);
  }
}
