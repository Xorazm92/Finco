import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserService } from '../../features/user-management/user.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector, private userService: UserService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) return true;

    // Telegraf context extraction
    const ctx = context.getArgByIndex(0);
    if (!ctx || !ctx.from || !ctx.chat) {
      // Optionally log for debugging
      // console.warn('RBAC: ctx, ctx.from, or ctx.chat is undefined');
      return false;
    }
    const telegramId = String(ctx.from.id);
    const chatId = String(ctx.chat.id);
    if (!telegramId || !chatId) {
      return false;
    }
    const user = await this.userService.findByTelegramId(telegramId);
    if (!user) return false;
    const role = await this.userService.getUserRoleInChat(user.id, chatId);
    if (!role) return false;
    return requiredRoles.includes(role as string);

  }
}
