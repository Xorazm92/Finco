import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessageLog } from '../message-logging/message-log.entity';
import { ResponseTimeTrackingService } from './response-time-tracking.service';
import { AiAnalysisModule } from '../ai/ai-analysis.module';

@Module({
  imports: [TypeOrmModule.forFeature([MessageLog]), AiAnalysisModule],
  providers: [ResponseTimeTrackingService],
  exports: [ResponseTimeTrackingService],
})
export class ResponseTimeTrackingModule {}
