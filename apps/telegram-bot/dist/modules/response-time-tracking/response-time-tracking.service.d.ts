import { Context } from 'telegraf';
export declare class ResponseTimeTrackingService {
  private readonly logger;
  private questionTimestamps;
  onQuestion(ctx: Context): void;
  onAnswer(ctx: Context): number | null;
}
