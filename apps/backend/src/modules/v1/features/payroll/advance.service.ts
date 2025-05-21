import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdvanceEntity } from './entities/advance.entity';
import { PayrollAuditLogService } from './payroll-audit-log.service';

@Injectable()
export class AdvanceService {
  constructor(
    @InjectRepository(AdvanceEntity)
    private readonly advanceRepo: Repository<AdvanceEntity>,
    @Inject(forwardRef(() => PayrollAuditLogService))
    private readonly auditLogService: PayrollAuditLogService,
  ) {}

  async create(data: Partial<AdvanceEntity> & { performedBy?: number }) {
    const result = await this.advanceRepo.save(data);
    if (data.user && data.company && data.amount) {
      await this.auditLogService.logAdvance({
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
    return this.advanceRepo.find({ relations: ['user', 'company'] });
  }

  async findByUserAndCompany(userId: number, companyId: number) {
    return this.advanceRepo.find({
      where: { user: { id: userId }, company: { id: companyId } },
      relations: ['user', 'company'],
    });
  }

  async remove(id: number, performedBy?: number) {
    const advance = await this.advanceRepo.findOne({
      where: { id },
      relations: ['user', 'company'],
    });
    const result = await this.advanceRepo.delete(id);
    if (advance && advance.user && advance.company && advance.amount) {
      await this.auditLogService.logAdvance({
        userId: advance.user.id,
        companyId: advance.company.id,
        amount: advance.amount,
        performedBy: performedBy || 0,
        comment: advance.comment,
        action: 'delete',
      });
    }
    return result;
  }
}
