import { Module, Global } from '@nestjs/common';
import { TelegramBotProvider } from './telegram.provider';

@Global()
@Module({
  providers: [TelegramBotProvider],
  exports: [TelegramBotProvider],
})
export class TelegramModule {}
