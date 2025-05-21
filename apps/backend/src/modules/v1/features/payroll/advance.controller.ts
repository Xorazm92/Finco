import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { AdvanceService } from './advance.service';

import { ApiBody } from '@nestjs/swagger';

@Controller('advance')
export class AdvanceController {
  constructor(private readonly advanceService: AdvanceService) {}

  @Get()
  async findAll(
    @Query('userId') userId?: number,
    @Query('companyId') companyId?: number,
  ) {
    if (userId && companyId)
      return this.advanceService.findByUserAndCompany(userId, companyId);
    return this.advanceService.findAll();
  }

  @Post()
  @ApiBody({
    schema: { example: { userId: 1, amount: 200000, reason: 'Avans uchun' } },
  })
  async create(@Body() data: any) {
    return this.advanceService.create(data);
  }

  @Delete(':id')
  async remove(
    @Param('id') id: number,
    @Body('performedBy') performedBy?: number,
  ) {
    return this.advanceService.remove(id, performedBy);
  }
}
