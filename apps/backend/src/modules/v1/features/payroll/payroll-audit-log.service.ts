import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLogEntity } from '../kpi/entities/audit-log.entity';

@Injectable()
export class PayrollAuditLogService {
  constructor(
    @InjectRepository(AuditLogEntity)
    private readonly auditLogRepo: Repository<AuditLogEntity>,
  ) {}

  async logBonus({
    userId,
    companyId,
    amount,
    performedBy,
    comment,
    action,
  }: {
    userId: number;
    companyId: number;
    amount: number;
    performedBy: number;
    comment?: string;
    action: 'create' | 'edit' | 'delete';
  }) {
    const log = this.auditLogRepo.create({
      action: `bonus_${action}`,
      kpiId: userId, // For now, store userId in kpiId field for cross-entity log
      performedBy,
      oldValue: '',
      oldComment: '',
      newValue: amount,
      newComment: comment,
      reason: `Bonus ${action} for user ${userId} in company ${companyId}`,
    });
    return this.auditLogRepo.save(log);
  }

  async logAdvance({
    userId,
    companyId,
    amount,
    performedBy,
    comment,
    action,
  }: {
    userId: number;
    companyId: number;
    amount: number;
    performedBy: number;
    comment?: string;
    action: 'create' | 'edit' | 'delete';
  }) {
    const log = this.auditLogRepo.create({
      action: `advance_${action}`,
      kpiId: userId,
      performedBy,
      oldValue: '',
      oldComment: '',
      newValue: amount,
      newComment: comment,
      reason: `Advance ${action} for user ${userId} in company ${companyId}`,
    });
    return this.auditLogRepo.save(log);
  }

  async logPenalty({
    userId,
    companyId,
    amount,
    performedBy,
    comment,
    action,
  }: {
    userId: number;
    companyId: number;
    amount: number;
    performedBy: number;
    comment?: string;
    action: 'create' | 'edit' | 'delete';
  }) {
    const log = this.auditLogRepo.create({
      action: `penalty_${action}`,
      kpiId: userId,
      performedBy,
      oldValue: '',
      oldComment: '',
      newValue: amount,
      newComment: comment,
      reason: `Penalty ${action} for user ${userId} in company ${companyId}`,
    });
    return this.auditLogRepo.save(log);
  }
}
