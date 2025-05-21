import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PenaltyEntity } from './entities/penalty.entity';
import { PayrollAuditLogService } from './payroll-audit-log.service';

@Injectable()
export class PenaltyService {
  constructor(
    @InjectRepository(PenaltyEntity)
    private readonly penaltyRepo: Repository<PenaltyEntity>,
    @Inject(forwardRef(() => PayrollAuditLogService))
    private readonly auditLogService: PayrollAuditLogService,
  ) {}

  async create(data: Partial<PenaltyEntity> & { performedBy?: number }) {
    const result = await this.penaltyRepo.save(data);
    if (data.user && data.company && data.amount) {
      await this.auditLogService.logPenalty({
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
    return this.penaltyRepo.find({ relations: ['user', 'company'] });
  }

  async findByUserAndCompany(userId: number, companyId: number) {
    return this.penaltyRepo.find({
      where: { user: { id: userId }, company: { id: companyId } },
      relations: ['user', 'company'],
    });
  }

  async remove(id: number, performedBy?: number) {
    const penalty = await this.penaltyRepo.findOne({
      where: { id },
      relations: ['user', 'company'],
    });
    const result = await this.penaltyRepo.delete(id);
    if (penalty && penalty.user && penalty.company && penalty.amount) {
      await this.auditLogService.logPenalty({
        userId: penalty.user.id,
        companyId: penalty.company.id,
        amount: penalty.amount,
        performedBy: performedBy || 0,
        comment: penalty.comment,
        action: 'delete',
      });
    }
    return result;
  }
}
