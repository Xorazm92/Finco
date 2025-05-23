import { Module, forwardRef } from '@nestjs/common';
import { TelegramBotModule } from '../../features/telegram-bot/telegram.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserChatRole } from './user-chat-role.entity';
import { UserService } from './user.service';
import { AuditLogModule } from '../../audit/audit-log.module';



@Module({
  imports: [
  TypeOrmModule.forFeature([User, UserChatRole]),
  AuditLogModule,
  forwardRef(() => TelegramBotModule),
],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
