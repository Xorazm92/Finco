import { Controller, Get, Post, Delete, Body, Param, Query } from '@nestjs/common';
import { BonusService } from './bonus.service';

import { ApiBody } from '@nestjs/swagger';

@Controller('bonus')
export class BonusController {
  constructor(private readonly bonusService: BonusService) {}

  @Get()
  async findAll(@Query('userId') userId?: number, @Query('companyId') companyId?: number) {
    if (userId && companyId) return this.bonusService.findByUserAndCompany(userId, companyId);
    return this.bonusService.findAll();
  }

  @Post()
  @ApiBody({ schema: { example: { userId: 1, amount: 500000, reason: 'Yaxshi ish uchun bonus' } } })
  async create(@Body() data: any) {
    return this.bonusService.create(data);
  }

  @Delete(':id')
  async remove(@Param('id') id: number, @Body('performedBy') performedBy?: number) {
    return this.bonusService.remove(id, performedBy);
  }
}
