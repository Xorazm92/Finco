import { Context } from 'telegraf';
import { ResponseTimeTrackingService } from './response-time-tracking.service';
export declare class ResponseTimeTrackingUpdate {
  private readonly responseTimeService;
  constructor(responseTimeService: ResponseTimeTrackingService);
  onText(ctx: Context): Promise<void>;
}
