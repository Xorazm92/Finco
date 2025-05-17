import { Module } from '@nestjs/common';
import { TelegrafModule } from 'nestjs-telegraf';
import { ConfigService, ConfigModule } from '@nestjs/config';
import { TelegramUpdate } from './telegram.update';
import { TelegramService } from './telegram.service';
import { EventEmitterModule } from '@nestjs/event-emitter';

import { ResponseTimeModule } from '../kpi-response-time/response-time.module';
import { UserModule } from '../user-management/user.module';

@Module({
  imports: [
    TelegrafModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (
        configService: ConfigService,
      ): import('nestjs-telegraf').TelegrafModuleOptions => ({
        token: configService.get<string>('telegram.botToken')!,
      }),
    }),
    EventEmitterModule.forRoot(),
    ResponseTimeModule,
    UserModule,
  ],
  providers: [TelegramUpdate, TelegramService],
  exports: [TelegramService],
})
export class TelegramModule {}
