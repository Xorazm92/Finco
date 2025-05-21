import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserRole } from '../enums/user-role.enum';
import { UserService } from '../../features/user-management/user.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private userService: UserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredRoles || requiredRoles.length === 0) return true;

    // Telegram uchun contextdan user va chat id ni olish
    const request = context.switchToHttp().getRequest();
    let telegramId: string | undefined;
    let chatId: string | undefined;

    if (request?.body?.message) {
      telegramId = String(request.body.message.from.id);
      chatId = String(request.body.message.chat.id);
    } else if (request?.user && request?.chatId) {
      telegramId = String(request.user.telegramId);
      chatId = String(request.chatId);
    }

    if (!telegramId || !chatId) {
      throw new ForbiddenException('Foydalanuvchi yoki chat aniqlanmadi');
    }

    // UserId ni aniqlash va UserChatRoleEntity orqali rolni tekshirish
    const user = await this.userService.findByTelegramId(telegramId);
    if (!user) {
      throw new ForbiddenException('Foydalanuvchi topilmadi');
    }
    const userRole = await this.userService.getUserRoleInChat(user.id, chatId);
    if (!userRole || !requiredRoles.includes(userRole)) {
      throw new ForbiddenException('Sizda ushbu amal uchun ruxsat yo‘q');
    }
    return true;
  }
}
