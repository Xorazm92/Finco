import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { UserChatRoleEntity } from './entities/user-chat-role.entity';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, UserChatRoleEntity])],
  providers: [UserService, { provide: APP_GUARD, useClass: RolesGuard }],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
