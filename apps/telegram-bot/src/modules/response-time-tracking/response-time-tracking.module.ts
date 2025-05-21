import { Module } from '@nestjs/common';
import { ResponseTimeTrackingService } from './response-time-tracking.service';
import { ResponseTimeTrackingUpdate } from './response-time-tracking.update';

@Module({
  providers: [ResponseTimeTrackingService, ResponseTimeTrackingUpdate],
})
export class ResponseTimeTrackingModule {}
