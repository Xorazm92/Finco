import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { PenaltyService } from './penalty.service';

import { ApiBody } from '@nestjs/swagger';

@Controller('penalty')
export class PenaltyController {
  constructor(private readonly penaltyService: PenaltyService) {}

  @Get()
  async findAll(
    @Query('userId') userId?: number,
    @Query('companyId') companyId?: number,
  ) {
    if (userId && companyId)
      return this.penaltyService.findByUserAndCompany(userId, companyId);
    return this.penaltyService.findAll();
  }

  @Post()
  @ApiBody({
    schema: {
      example: {
        userId: 1,
        amount: 100000,
        reason: 'Kechikkanligi uchun jarima',
      },
    },
  })
  async create(@Body() data: any) {
    return this.penaltyService.create(data);
  }

  @Delete(':id')
  async remove(
    @Param('id') id: number,
    @Body('performedBy') performedBy?: number,
  ) {
    return this.penaltyService.remove(id, performedBy);
  }
}
