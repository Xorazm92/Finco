// src/features/telegram-bot/telegram.module.ts
import { Module, Global } from '@nestjs/common';
import { TelegrafModule } from 'nestjs-telegraf';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TelegramUpdate } from './telegram.update'; // To'g'ri import yo'li
import { TelegramService } from './telegram.service';   // To'g'ri import yo'li
import { UserModule } from '../user-management/user.module'; // UserService ni olish uchun
// Boshqa kerakli modullarni import qiling, masalan:
import { ResponseTimeModule } from '../kpi-response-time/response-time.module';
import { AiQueueModule } from '../artificial-intelligence/ai-queue.module';
// ... va hokazo, TelegramUpdate ichida ishlatiladigan barcha servislar tegishli modullardan olinishi kerak

@Global() // Agar TelegramService ni boshqa joylarda @Inject() qilmoqchi bo'lsangiz
@Module({
  imports: [
    ConfigModule, // Agar ConfigService global qilinmagan bo'lsa
    UserModule,   // UserService ni TelegramUpdate ga inject qilish uchun
    // TelegramUpdate ichida ishlatiladigan boshqa modullar:
    ResponseTimeModule, // ResponseTimeService uchun
    AiQueueModule,      // AiQueueService uchun
    // ... boshqa modullar
    TelegrafModule.forRootAsync({
      imports: [ConfigModule], // Bu yerda ConfigModule kerak
      useFactory: async (configService: ConfigService) => {
        const token = configService.get<string>('TELEGRAM_BOT_TOKEN');
        if (!token) {
          // Bu xatolik konsolda chiqishi kerak edi. .env faylingizni tekshiring!
          throw new Error('TELEGRAM_BOT_TOKEN is not defined in .env file or ConfigService');
        }
        return {
          token: token
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