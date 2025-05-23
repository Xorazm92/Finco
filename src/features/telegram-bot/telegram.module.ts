// src/features/telegram-bot/telegram.module.ts
import { Module, Global, forwardRef } from '@nestjs/common';
import { TelegrafModule } from 'nestjs-telegraf';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TelegramUpdate } from './telegram.update';
import { TelegramService } from './telegram.service';
import { UserModule } from '../user-management/user.module';
import { MessageLoggingModule } from '../../modules/message-logging/message-logging.module';
import { ResponseTimeTrackingModule } from '../../modules/response-time-tracking/response-time-tracking.module';
import { HumanFeedbackModule } from '../artificial-intelligence/human-feedback.module';
import { AiAnalysisModule } from '../artificial-intelligence/ai-analysis.module';
// ... boshqa kerakli modullar

@Global() // Agar TelegramService ni boshqa joylarda @Inject() qilmoqchi bo'lsangiz
@Module({
  imports: [
    ConfigModule,
    forwardRef(() => UserModule),
    forwardRef(() => MessageLoggingModule),
    forwardRef(() => ResponseTimeTrackingModule),
    forwardRef(() => HumanFeedbackModule),
    forwardRef(() => AiAnalysisModule),
    TelegrafModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const token = configService.get<string>('TELEGRAM_BOT_TOKEN');
        if (!token) {
          throw new Error('TELEGRAM_BOT_TOKEN is not defined in .env file or ConfigService');
        }
        return {
  token: token,
};
      },
      inject: [ConfigService],
    }),
  ],
  // controllers: [], // TelegrafModule Update klassini o'zi topadi, kontroller shart emas
  providers: [
    TelegramUpdate, // Bu Update klassi, TelegrafModule buni avtomatik topadi va ishga tushiradi
    TelegramService,
    // UserService bu yerda provayd qilinishi shart emas, agar UserModule dan eksport qilinsa va UserModule imports da bo'lsa.
    // Boshqa servislar ham o'z modullaridan eksport qilinib, bu yerda imports orqali olinishi kerak.
  ],
  exports: [TelegramService], // Agar boshqa modullar TelegramService ni ishlatsa
})
export class TelegramBotModule {} // Modul nomini o'zgartirdim