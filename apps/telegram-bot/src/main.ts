import { NestFactory } from '@nestjs/core';
import { TelegramModule } from './modules/telegram.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(TelegramModule, {
    bufferLogs: true,
  });
  app.useLogger(app.get(Logger));
  await app.listen(3001);
  Logger.log('Telegram bot NestJS ilovasi ishga tushdi!');
}

bootstrap();
