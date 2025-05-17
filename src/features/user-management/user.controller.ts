import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { UserEntity } from './entities/user.entity';
import { UserService } from './user.service';
import { CreateUserDto } from '../../shared/dtos/user.dto';
import { Roles } from '../../shared/decorators/roles.decorator';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { UserRole } from './entities/user-role.enum';

@Controller({ path: 'users', version: '1' })
@UseGuards(RolesGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @Roles(UserRole.ADMIN)
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR)
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() dto: CreateUserDto) {
    // Map role from DTO (shared/enums) to Entity enum (entities/user-role.enum)
    const userData: Partial<UserEntity> = {
      telegramId: dto.telegramId,
      firstName: dto.firstName,
      lastName: dto.lastName,
      username: dto.username,
      role: dto.role ? (UserRole as any)[dto.role as any] ?? UserRole.CLIENT : UserRole.CLIENT,
    };
    return this.userService.createOrUpdate(userData);
  }
}
