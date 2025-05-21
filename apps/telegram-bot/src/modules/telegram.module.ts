import { Module, Global } from '@nestjs/common';
import { TelegrafModule } from 'nestjs-telegraf';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TelegramController } from './telegram.controller';
import { TelegramService } from './telegram.service';
// Functional modules
import { ResponseTimeTrackingModule } from '../response-time-tracking/response-time-tracking.module';
import { ReportSubmissionTrackingModule } from '../report-submission-tracking/report-submission-tracking.module';
import { AttendanceTrackingModule } from '../attendance-tracking/attendance-tracking.module';
import { UserManagementModule } from '../user-management/user-management.module';
import { AiInteractionModule } from '../ai-interaction/ai-interaction.module';
import { UserKpiViewModule } from '../user-kpi-view/user-kpi-view.module';
import { AdminKpiManagementModule } from '../admin-kpi-management/admin-kpi-management.module';
import { MessageLoggingModule } from '../message-logging/message-logging.module';
import { RbacModule } from '../rbac/rbac.module';

@Global()
@Module({
  imports: [
    ConfigModule,
    TelegrafModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const token = configService.get<string>('TELEGRAM_BOT_TOKEN');
        if (!token) {
          throw new Error('TELEGRAM_BOT_TOKEN is not defined in .env file');
        }
        return { token };
      },
      inject: [ConfigService],
    }),
    ResponseTimeTrackingModule,
    ReportSubmissionTrackingModule,
    AttendanceTrackingModule,
    UserManagementModule,
    AiInteractionModule,
    UserKpiViewModule,
    AdminKpiManagementModule,
    MessageLoggingModule,
    RbacModule,
  ],
  controllers: [TelegramController],
  providers: [TelegramService],
  exports: [TelegramService],
})
export class TelegramModule {}
