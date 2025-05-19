import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessageLogEntity } from './entities/message-log.entity';
import { ResponseTimeService } from './response-time.service';
import { MessageListener } from './listeners/message.listener';
import { UserEntity } from '../user-management/entities/user.entity';
import { UserModule } from '../user-management/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([MessageLogEntity, UserEntity]), UserModule],
  providers: [ResponseTimeService, MessageListener],
  exports: [ResponseTimeService],
})
export class ResponseTimeModule {}
