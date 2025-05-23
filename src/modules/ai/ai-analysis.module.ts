import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiAnalysisService } from './ai-analysis.service';
import { AiAnalysisResult } from './ai-analysis-result.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AiAnalysisResult])],
  providers: [AiAnalysisService],
  exports: [AiAnalysisService],
})
export class AiAnalysisModule {}
