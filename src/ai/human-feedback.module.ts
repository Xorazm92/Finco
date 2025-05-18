import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HumanFeedbackEntity } from './entities/human-feedback.entity';
import { HumanFeedbackService } from './human-feedback.service';

import { HumanFeedbackController } from './human-feedback.controller';

@Module({
  imports: [TypeOrmModule.forFeature([HumanFeedbackEntity])],
  providers: [HumanFeedbackService],
  controllers: [HumanFeedbackController],
  exports: [HumanFeedbackService],
})
export class HumanFeedbackModule {}
