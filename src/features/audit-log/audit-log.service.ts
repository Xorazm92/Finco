
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLogEntity } from './entities/audit-log.entity';

@Injectable()
export class AuditLogService {
  constructor(
    @InjectRepository(AuditLogEntity)
    private auditLogRepo: Repository<AuditLogEntity>,
  ) {}

  async logAction(userId: number, action: string, details: string): Promise<AuditLogEntity> {
    const log = new AuditLogEntity();
    log.userId = userId;
    log.action = action;
    log.details = details;
    log.timestamp = new Date();
    
    return await this.auditLogRepo.save(log);
  }

  async getLogsForUser(userId: number): Promise<AuditLogEntity[]> {
    return await this.auditLogRepo.find({
      where: { userId },
      order: { timestamp: 'DESC' },
    });
  }
}
