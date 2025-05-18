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
    return this.kpiRepository.find({ where: { userId }, order: { createdAt: 'DESC' } });
  }

  async findById(id: number): Promise<KpiEntity | undefined> {
    const kpi = await this.kpiRepository.findOne({ where: { id } });
    return kpi ?? undefined;
  }

  async updateKpi(id: number, value: number, comment?: string): Promise<KpiEntity | undefined> {
    const kpi = await this.findById(id);
    if (!kpi) return undefined;
    kpi.value = value;
    kpi.comment = comment;
    return this.kpiRepository.save(kpi);
  }

  async deleteKpi(id: number): Promise<KpiEntity | undefined> {
    const kpi = await this.findById(id);
    if (!kpi) return undefined;
    await this.kpiRepository.delete(id);
    return kpi;
  }
}
