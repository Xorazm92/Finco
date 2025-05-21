import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiAnalysisResultEntity } from './entities/ai-analysis-result.entity';
import { AiAnalysisResultService } from './ai-analysis-result.service';

import { AiAnalysisResultController } from './ai-analysis-result.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AiAnalysisResultEntity])],
  providers: [AiAnalysisResultService],
  controllers: [AiAnalysisResultController],
  exports: [AiAnalysisResultService],
})
export class AiAnalysisResultModule {}
