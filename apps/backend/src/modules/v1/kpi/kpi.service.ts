import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { KpiEntity } from './entities/kpi.entity';
import { CreateKpiDto } from './dto/create-kpi.dto';

@Injectable()
export class KpiService {
  constructor(
    @InjectRepository(KpiEntity)
    private readonly kpiRepository: Repository<KpiEntity>,
    private readonly auditLogService: import('./audit-log.service').AuditLogService,
  ) {}

  async create(userId: number, dto: CreateKpiDto): Promise<KpiEntity> {
    const kpi = this.kpiRepository.create({
      userId,
      value: dto.value,
      comment: dto.comment,
    });
    return this.kpiRepository.save(kpi);
  }

  async findByUser(userId: number): Promise<KpiEntity[]> {
    return this.kpiRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: number): Promise<KpiEntity | undefined> {
    const kpi = await this.kpiRepository.findOne({ where: { id } });
    return kpi ?? undefined;
  }

  async updateKpi(
    id: number,
    value: number,
    comment?: string,
    performedBy?: number,
    reason?: string,
  ): Promise<KpiEntity | undefined> {
    const kpi = await this.findById(id);
    if (!kpi) return undefined;
    const oldValue = kpi.value;
    const oldComment = kpi.comment;
    kpi.value = value;
    kpi.comment = comment;
    const updated = await this.kpiRepository.save(kpi);
    // Audit log
    await this.auditLogService.logEdit({
      kpiId: kpi.id,
      performedBy: performedBy || 0,
      oldValue: oldValue,
      oldComment: oldComment || '',
      newValue: value,
      newComment: comment || '',
      reason: reason || 'KPI edit via bot',
    });
    return updated;
  }

  async deleteKpi(
    id: number,
    performedBy?: number,
    reason?: string,
  ): Promise<KpiEntity | undefined> {
    const kpi = await this.findById(id);
    if (!kpi) return undefined;
    await this.kpiRepository.delete(id);
    // Audit log
    await this.auditLogService.logDelete({
      kpiId: kpi.id,
      performedBy: performedBy || 0,
      oldValue: kpi.value,
      oldComment: kpi.comment || '',
      reason: reason || 'KPI delete via bot',
    });
    return kpi;
  }
}
