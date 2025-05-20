import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { KpiDefinitionEntity } from './entities/kpi-definition.entity';

@Injectable()
export class KpiDefinitionService {
  constructor(
    @InjectRepository(KpiDefinitionEntity)
    private readonly kpiDefRepo: Repository<KpiDefinitionEntity>,
  ) {}

  async create(data: Partial<KpiDefinitionEntity>) {
    return this.kpiDefRepo.save(data);
  }

  async findAll() {
    return this.kpiDefRepo.find();
  }

  async findOne(id: number) {
    return this.kpiDefRepo.findOneBy({ id });
  }

  async update(id: number, data: Partial<KpiDefinitionEntity>) {
    await this.kpiDefRepo.update(id, data);
    return this.findOne(id);
  }

  async remove(id: number) {
    return this.kpiDefRepo.delete(id);
  }
}
