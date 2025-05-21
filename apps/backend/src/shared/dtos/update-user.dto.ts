import { IsEnum, IsOptional, IsString } from 'class-validator';
import { UserRole } from '../enums/user-role.enum';

import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({
    example: 'Ali',
    required: false,
    description: 'User first name',
  })
  @IsOptional()
  @IsString()
  firstName?: string;

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

  @ApiProperty({
    example: 'ADMIN',
    enum: UserRole,
    required: false,
    description: 'User role',
  })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiProperty({
    example: 'newpassword123',
    required: false,
    description: 'User password',
  })
  @IsOptional()
  @IsString()
  password?: string;
}
