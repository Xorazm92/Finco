import { Module, Global } from '@nestjs/common';
import { TelegrafModule } from 'nestjs-telegraf';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TelegramController } from './telegram.controller';
import { TelegramService } from './telegram.service';
import { UserService } from '../user-management/user.service';

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
  ],
  controllers: [TelegramController],
  providers: [TelegramService, UserService],
  exports: [TelegramService],
})
export class TelegramModule {}
