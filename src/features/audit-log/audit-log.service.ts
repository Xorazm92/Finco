
import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientProxy } from '@nestjs/microservices';
import { AuditLogEntity } from './entities/audit-log.entity';

@Injectable()
export class AuditLogService {
  constructor(
    @InjectRepository(AuditLogEntity)
    private readonly auditLogRepo: Repository<AuditLogEntity>,
    @Inject('AUDIT_SERVICE') private readonly auditClient: ClientProxy,
  ) {}

  async logAction(action: string, userId: number, details: any) {
    const log = this.auditLogRepo.create({
      action,
      userId,
      details,
      timestamp: new Date(),
    });
    await this.auditLogRepo.save(log);
    await this.auditClient.emit('audit_log_created', log).toPromise();
  }

  async getAuditLogs(userId?: number) {
    const query = this.auditLogRepo.createQueryBuilder('audit_log');
    if (userId) {
      query.where('audit_log.userId = :userId', { userId });
    }
    return query.orderBy('audit_log.timestamp', 'DESC').getMany();
  }
}
