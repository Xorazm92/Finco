import { Context } from 'telegraf';
import { ResponseTimeService } from '../kpi-response-time/response-time.service';
import { UserService } from '../user-management/user.service';
import { AiQueueService } from '../artificial-intelligence/ai-queue.service';
import { AiAnalysisResultService } from '../artificial-intelligence/ai-analysis-result.service';
import { HumanFeedbackService } from '../artificial-intelligence/human-feedback.service';
import { ReportSubmissionService } from '../kpi-report-submission/report-submission.service';
import { AttendanceLogService } from '../attendance-log/attendance-log.service';
import { AuditLogService } from '../audit-log/audit-log.service';
export declare class TelegramUpdate {
  private readonly responseTimeService;
  private readonly userService;
  private readonly aiQueueService;
  private readonly aiAnalysisResultService;
  private readonly humanFeedbackService;
  private readonly kpiCalculationService;
  private readonly reportSubmissionService;
  private readonly attendanceLogService;
  private readonly auditLogService;
  constructor(
    responseTimeService: ResponseTimeService,
    userService: UserService,
    aiQueueService: AiQueueService,
    aiAnalysisResultService: AiAnalysisResultService,
    humanFeedbackService: HumanFeedbackService,
    kpiCalculationService: import('../kpi-calculation/kpi-calculation.service').KpiCalculationService,
    reportSubmissionService: ReportSubmissionService,
    attendanceLogService: AttendanceLogService,
    auditLogService: AuditLogService,
  );
  onStart(ctx: Context): Promise<void>;
  onHelp(ctx: Context): Promise<void>;
  onMessage(message: any, ctx: Context): Promise<void>;
  reviewAiResults(
    ctx: Context,
  ): Promise<import('@telegraf/types').Message.TextMessage | undefined>;
  analyzeSentiment(
    ctx: Context,
  ): Promise<import('@telegraf/types').Message.TextMessage | undefined>;
  getAnalysisResult(
    ctx: Context,
  ): Promise<import('@telegraf/types').Message.TextMessage | undefined>;
  assignRole(
    ctx: Context,
    text: string,
  ): Promise<import('@telegraf/types').Message.TextMessage | undefined>;
  auditLog(
    ctx: Context,
  ): Promise<import('@telegraf/types').Message.TextMessage | undefined>;
  auditLogLast(
    ctx: Context,
  ): Promise<import('@telegraf/types').Message.TextMessage | undefined>;
  checkIn(ctx: Context): Promise<import('@telegraf/types').Message.TextMessage>;
  checkOut(
    ctx: Context,
  ): Promise<import('@telegraf/types').Message.TextMessage>;
  submitReport(
    ctx: Context,
  ): Promise<import('@telegraf/types').Message.TextMessage | undefined>;
  myKpi(
    ctx: Context,
  ): Promise<import('@telegraf/types').Message.TextMessage | undefined>;
  kpiStats(ctx: Context): Promise<void>;
  adminTest(ctx: Context): Promise<void>;
  onCallbackQuery(ctx: Context): Promise<void>;
}
