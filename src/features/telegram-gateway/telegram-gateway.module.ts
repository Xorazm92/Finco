
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TelegrafModule } from 'nestjs-telegraf';
import { TelegramGatewayService } from './telegram-gateway.service';
import { TelegramGatewayUpdate } from './telegram-gateway.update';

@Module({
  imports: [
    ConfigModule,
    TelegrafModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        token: configService.get<string>('TELEGRAM_BOT_TOKEN'),
      }),
    }),
  ],
  providers: [TelegramGatewayService, TelegramGatewayUpdate],
  exports: [TelegramGatewayService],
})
export class TelegramGatewayModule {}
