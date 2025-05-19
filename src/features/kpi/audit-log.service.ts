import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLogEntity } from './entities/audit-log.entity';

@Injectable()
export class AuditLogService {
  constructor(
    @InjectRepository(AuditLogEntity)
    private readonly auditLogRepo: Repository<AuditLogEntity>,
  ) {}

  async logEdit(params: {
    kpiId: number;
    performedBy: number;
    oldValue: number;
    oldComment: string;
    newValue: number;
    newComment: string;
    reason?: string;
  }) {
    const log = this.auditLogRepo.create({
      action: 'edit',
      kpiId: params.kpiId,
      performedBy: params.performedBy,
      oldValue: params.oldValue,
      oldComment: params.oldComment,
      newValue: params.newValue,
      newComment: params.newComment,
      reason: params.reason,
    });
    return this.auditLogRepo.save(log);
  }

  async logDelete(params: {
    kpiId: number;
    performedBy: number;
    oldValue: number;
    oldComment: string;
    reason?: string;
  }) {
    const log = this.auditLogRepo.create({
      action: 'delete',
      kpiId: params.kpiId,
      performedBy: params.performedBy,
      oldValue: params.oldValue,
      oldComment: params.oldComment,
      reason: params.reason,
    });
    return this.auditLogRepo.save(log);
  }

  async findByKpiId(kpiId: number): Promise<AuditLogEntity[]> {
    return this.auditLogRepo.find({
      where: { kpiId },
      order: { createdAt: 'DESC' },
    });
  }

  async findByUserId(userId: number): Promise<AuditLogEntity[]> {
    return this.auditLogRepo.find({
      where: { performedBy: userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findLast(n: number): Promise<AuditLogEntity[]> {
    return this.auditLogRepo.find({
      order: { createdAt: 'DESC' },
      take: n,
    });
  }
}
