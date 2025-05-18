import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessageLogEntity } from './entities/message-log.entity';
import { MessageLogService } from './message-log.service';

@Module({
  imports: [TypeOrmModule.forFeature([MessageLogEntity])],
  providers: [MessageLogService],
  exports: [MessageLogService],
})
export class MessageLogModule {}
