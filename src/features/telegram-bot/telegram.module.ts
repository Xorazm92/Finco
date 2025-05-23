
import { Module } from '@nestjs/common';
import { TelegrafModule } from 'nestjs-telegraf';
import { ConfigService } from '@nestjs/config';
import { TelegramUpdate } from './telegram.update';
import { UserModule } from '../user-management/user.module';
import { MessageLogModule } from '../message-log/message-log.module';
import { ResponseTimeTrackingModule } from '../kpi-response-time/response-time.module';
import { AiModule } from '../artificial-intelligence/ai.module';
import { KpiModule } from '../kpi/kpi.module';
import { ReportSubmissionModule } from '../kpi-report-submission/report-submission.module';

@Module({
  imports: [
    TelegrafModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        token: configService.get<string>('TELEGRAM_BOT_TOKEN'),
      }),
    }),
    UserModule,
    MessageLogModule,
    ResponseTimeTrackingModule,
    AiModule,
    KpiModule,
    ReportSubmissionModule,
  ],
  providers: [TelegramUpdate],
})
export class TelegramBotModule {}
