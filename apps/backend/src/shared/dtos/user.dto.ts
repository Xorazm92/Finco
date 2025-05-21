import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { UserRole } from '../enums/user-role.enum';

import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: '123456789', description: 'Telegram user ID' })
  @IsNotEmpty()
  @IsString()
  telegramId: string;

  @ApiProperty({ example: 'Ali', description: 'User first name' })
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @ApiProperty({
    example: 'Valiyev',
    required: false,
    description: 'User last name',
  })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty({
    example: 'ali_valiyev',
    required: false,
    description: 'Telegram username',
  })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiProperty({ example: 'ADMIN', enum: UserRole, description: 'User role' })
  @IsEnum(UserRole)
  role: UserRole;
}
