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

  async logAction(
    action: string,
    performedBy: string,
    affectedUser?: string,
    details?: any,
  ) {
    const log = this.auditLogRepo.create({
      action,
      performedBy,
      affectedUser,
      details: details ? JSON.stringify(details) : undefined,
    });
    return this.auditLogRepo.save(log);
  }

  async getLastLogs(limit = 10) {
    return this.auditLogRepo.find({
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async getLogsByUser(userId: string, limit = 10) {
    return this.auditLogRepo.find({
      where: [{ performedBy: userId }, { affectedUser: userId }],
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }
}
