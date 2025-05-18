import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateKpiDto {
  @IsNumber()
  value: number;

  @IsOptional()
  @IsString()
  comment?: string;
}
