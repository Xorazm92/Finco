import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { UserEntity } from './entities/user.entity';
import { UserService } from './user.service';
import { CreateUserDto } from '../../shared/dtos/user.dto';
import { UpdateUserDto } from '../../shared/dtos/update-user.dto';
import { Roles } from '../../shared/decorators/roles.decorator';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { UserRole } from '../../shared/enums/user-role.enum';

@ApiTags('Users')
@Controller({ path: 'users', version: '1' })
@UseGuards(RolesGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiOperation({ summary: 'Get all users (ADMIN only)' })
  @ApiResponse({
    status: 200,
    description: 'List of users',
    type: [UserEntity],
  })
  @Roles(UserRole.ADMIN)
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID (ADMIN, SUPERVISOR)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'User found', type: UserEntity })
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findOne(id);
  }

  @Post()
  @ApiOperation({
    summary: 'Create new user (ADMIN only)',
    description:
      'Request must include Bearer JWT token in Authorization header. Only REST clients with admin privileges can use this endpoint.',
  })
  @ApiBody({
    schema: {
      example: {
        telegramId: '123456789',
        firstName: 'Ali',
        lastName: 'Valiyev',
        username: 'ali_valiyev',
        role: 'ADMIN',
        password: 'admin123',
      },
      properties: {
        telegramId: { type: 'string', example: '123456789' },
        firstName: { type: 'string', example: 'Ali' },
        lastName: { type: 'string', example: 'Valiyev' },
        username: { type: 'string', example: 'ali_valiyev' },
        role: {
          type: 'string',
          example: 'ADMIN',
          enum: [
            'ADMIN',
            'SUPERVISOR',
            'CLIENT',
            'ACCOUNTANT',
            'BANK_CLIENT',
            'DIRECTOR',
            'OTHER_INTERNAL',
          ],
        },
        password: { type: 'string', example: 'admin123' },
      },
      required: ['telegramId', 'firstName', 'username', 'role', 'password'],
    },
  })
  @ApiResponse({ status: 201, description: 'User created', type: UserEntity })
  @Roles(UserRole.ADMIN)
  create(@Body() dto: CreateUserDto) {
    const userData: Partial<UserEntity> = {
      telegramId: dto.telegramId,
      firstName: dto.firstName,
      lastName: dto.lastName,
      username: dto.username,
    };
    return this.userService.createOrUpdate(userData);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user by ID (ADMIN only)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({ status: 200, description: 'User updated', type: UserEntity })
  @Roles(UserRole.ADMIN)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserDto,
  ) {
    return this.userService.updateUser(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete user by ID (ADMIN only)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 204, description: 'User deleted' })
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.userService.deleteUser(id);
  }
}
