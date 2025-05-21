import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessageLogEntity } from './entities/message-log.entity';
import { MessageLogTimeoutService } from './message-log.timeout';

@Module({
  imports: [TypeOrmModule.forFeature([MessageLogEntity])],
  providers: [MessageLogTimeoutService],
  exports: [MessageLogTimeoutService],
})
export class MessageLogTimeoutModule {}
