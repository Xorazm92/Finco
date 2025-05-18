import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AiAnalysisResultEntity } from './entities/ai-analysis-result.entity';

@Injectable()
export class AiAnalysisResultService {
  constructor(
    @InjectRepository(AiAnalysisResultEntity)
    private readonly resultRepo: Repository<AiAnalysisResultEntity>,
  ) {}

  async saveResult(data: Partial<AiAnalysisResultEntity>) {
    const entity = this.resultRepo.create(data);
    return this.resultRepo.save(entity);
  }

  async findById(id: number) {
    return this.resultRepo.findOne({ where: { id } });
  }

  async findLatest(type?: string, limit = 20) {
    return this.resultRepo.find({
      where: type ? { type } : {},
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }
}
