// // import { Module, forwardRef } from '@nestjs/common';
// // import { TelegrafModule } from 'nestjs-telegraf';
// // import { ConfigModule, ConfigService } from '@nestjs/config';
// // import { TelegramUpdate } from './telegram.update';
// // import { MessageLoggingModule } from '../message-logging/message-logging.module';
// // import { TelegramService } from './telegram.service';
// // import { HumanFeedbackModule } from '../ai/human-feedback.module';
// // import { AiAnalysisModule } from '../../features/artificial-intelligence/ai-analysis.module';
// // import { ResponseTimeTrackingModule } from '../response-time-tracking/response-time-tracking.module';
// // // import { UserModule } from '../user/user.module';
// // import { UserModule } from '../../features/user-management/user.module'; // <-- TO'G'RI YO'L


// // @Module({
//   imports: [
//     ConfigModule,
//     TelegrafModule.forRootAsync({
//       imports: [ConfigModule],
//       inject: [ConfigService],
//       useFactory: async (configService: ConfigService) => {
//         const token = configService.get<string>('TELEGRAM_BOT_TOKEN');
//         if (!token) throw new Error('TELEGRAM_BOT_TOKEN is not set');
//         return { token };
//       },
//     }),
//     forwardRef(() => UserModule),
//     forwardRef(() => MessageLoggingModule),
//     forwardRef(() => ResponseTimeTrackingModule),
//     forwardRef(() => HumanFeedbackModule),
//     forwardRef(() => AiAnalysisModule),
//   ],
//   // providers: [TelegramUpdate, TelegramService],
//   // exports: [TelegramService],
// })
// // export class TelegramCoreModule {}
