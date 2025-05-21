import { Module } from '@nestjs/common';
import { AiModule } from './features/artificial-intelligence/ai.module';
import { MessageLogModule } from './features/message-log/message-log.module';
import { MessageLogTimeoutModule } from './features/message-log/message-log-timeout.module';
import { MessageLogTimeoutCronModule } from './features/message-log/message-log-timeout-cron.module';
import { TelegramModule } from './features/telegram-bot/telegram.module';
import { KpiModule } from './features/kpi/kpi.module';
import { KpiReportModule } from './features/kpi/kpi-report.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CoreModule } from './core/core.module';
import { DatabaseModule } from './core/database/database.module';
import { LoggerModule } from './core/logger/logger.module';
// import { TelegramModule } from './features/telegram/telegram.module';
import { UserModule } from './features/user-management/user.module';
import { ResponseTimeModule } from './features/kpi-response-time/response-time.module';
import { ReportSubmissionModule } from './features/kpi-report-submission/report-submission.module';
import { KpiCalculationModule } from './features/kpi-calculation/kpi-calculation.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    CoreModule,
    DatabaseModule,
    LoggerModule,
    // TelegramModule,
    UserModule,
    ResponseTimeModule,
    ReportSubmissionModule,
    KpiCalculationModule,
    AuthModule,
    AiModule,
    KpiReportModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
