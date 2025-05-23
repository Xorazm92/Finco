
import { IsString, IsOptional, IsBoolean, IsDate, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMessageLogDto {
  @ApiProperty({ description: 'Telegram message ID' })
  @IsString()
  telegramMessageId: string;

  @ApiProperty({ description: 'Telegram chat ID' })
  @IsString()
  telegramChatId: string;

  @ApiProperty({ description: 'Message text content', required: false })
  @IsOptional()
  @IsString()
  textContent?: string;

  @ApiProperty({ description: 'Is this message a question', required: false })
  @IsOptional()
  @IsBoolean()
  isQuestion?: boolean;

  @ApiProperty({ description: 'Message sent timestamp' })
  @IsDate()
  sentAt: Date;

  @ApiProperty({ description: 'User ID who sent the message' })
  @IsNumber()
  userId: number;
}
