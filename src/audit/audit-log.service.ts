import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './audit-log.entity';

@Injectable()
export class AuditLogService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepo: Repository<AuditLog>
  ) {}

  async logAction(action: string, performedBy: string, target?: string, details?: any) {
    const entity = this.auditLogRepo.create({ action, performedBy, target, details });
    return this.auditLogRepo.save(entity);
  }
}
