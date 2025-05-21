import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { UserService } from '../user-management/user.service';
import { KpiService } from '../kpi/kpi.service';
import { KpiAnalyticsService } from '../kpi/kpi-analytics.service';
import { AuditLogService } from '../kpi/audit-log.service';
import { MessageLogService } from '../message-log/message-log.service';
import { ReportSubmissionService } from '../kpi-report-submission/report-submission.service';
import { KpiCalculationService } from '../kpi/kpi-calculation.service';
import { ReportTypeEntity } from '../kpi-report-submission/entities/report-type.entity';
export declare class TelegramBotProvider implements OnModuleInit {
  private readonly configService;
  private readonly userService;
  private readonly kpiService;
  private readonly kpiAnalyticsService;
  private readonly messageLogService;
  private readonly reportSubmissionService;
  private readonly reportTypeRepo;
  private readonly kpiCalculationService;
  private readonly auditLogService;
  private bot;
  private readonly logger;
  constructor(
    configService: ConfigService,
    userService: UserService,
    kpiService: KpiService,
    kpiAnalyticsService: KpiAnalyticsService,
    messageLogService: MessageLogService,
    reportSubmissionService: ReportSubmissionService,
    reportTypeRepo: Repository<ReportTypeEntity>,
    kpiCalculationService: KpiCalculationService,
    auditLogService: AuditLogService,
  );
  onModuleInit(): void;
  private handleAiFeedbackCommand;
  private handleReviewAiAssessmentCommand;
  private initHandlers;
}
