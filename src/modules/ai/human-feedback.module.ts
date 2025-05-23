import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HumanFeedback } from './human-feedback.entity';
import { HumanFeedbackService } from './human-feedback.service';

@Module({
  imports: [TypeOrmModule.forFeature([HumanFeedback])],
  providers: [HumanFeedbackService],
  exports: [HumanFeedbackService],
})
export class HumanFeedbackModule {}
