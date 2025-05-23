import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessageLog } from './message-log.entity';
import { MessageLoggingService } from './message-logging.service';
import { UserModule } from '../user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([MessageLog]), UserModule],
  providers: [MessageLoggingService],
  exports: [MessageLoggingService],
})
export class MessageLoggingModule {}
