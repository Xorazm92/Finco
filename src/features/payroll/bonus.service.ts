import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BonusEntity } from './entities/bonus.entity';
import { PayrollAuditLogService } from './payroll-audit-log.service';

@Injectable()
export class BonusService {
  constructor(
    @InjectRepository(BonusEntity)
    private readonly bonusRepo: Repository<BonusEntity>,
    @Inject(forwardRef(() => PayrollAuditLogService))
    private readonly auditLogService: PayrollAuditLogService,
  ) {}

  async create(data: Partial<BonusEntity> & { performedBy?: number }) {
    const result = await this.bonusRepo.save(data);
    if (data.user && data.company && data.amount) {
      await this.auditLogService.logBonus({
        userId: data.user.id,
        companyId: data.company.id,
        amount: data.amount,
        performedBy: data.performedBy || 0,
        comment: data.comment,
        action: 'create',
      });
    }
    return result;
  }

  async findAll() {
    return this.bonusRepo.find({ relations: ['user', 'company'] });
  }

  async findByUserAndCompany(userId: number, companyId: number) {
    return this.bonusRepo.find({
      where: { user: { id: userId }, company: { id: companyId } },
      relations: ['user', 'company'],
    });
  }

  async remove(id: number, performedBy?: number) {
    const bonus = await this.bonusRepo.findOne({ where: { id }, relations: ['user', 'company'] });
    const result = await this.bonusRepo.delete(id);
    if (bonus && bonus.user && bonus.company && bonus.amount) {
      await this.auditLogService.logBonus({
        userId: bonus.user.id,
        companyId: bonus.company.id,
        amount: bonus.amount,
        performedBy: performedBy || 0,
        comment: bonus.comment,
        action: 'delete',
      });
    }
    return result;
  }
}
