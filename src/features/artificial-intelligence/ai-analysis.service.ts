import { Injectable } from '@nestjs/common';
import { Module } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AiAnalysisResultEntity } from './entities/ai-analysis-result.entity';



@Injectable()
export class AiAnalysisService {
  constructor(
    @InjectRepository(AiAnalysisResultEntity)
    private readonly aiAnalysisRepo: Repository<AiAnalysisResultEntity>,
  ) {}

  async findById(id: number): Promise<AiAnalysisResultEntity | null> {
    return this.aiAnalysisRepo.findOne({ where: { id } });
  }

  async saveAnalysis(
    data: Partial<AiAnalysisResultEntity>,
  ): Promise<AiAnalysisResultEntity> {
    const entity = this.aiAnalysisRepo.create(data);
    return this.aiAnalysisRepo.save(entity);
  }

  async findLatest(limit: number = 20): Promise<AiAnalysisResultEntity[]> {
    return this.aiAnalysisRepo.find({
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async findByType(
    type: string,
    limit: number = 20,
  ): Promise<AiAnalysisResultEntity[]> {
    return this.aiAnalysisRepo.find({
      where: { type },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }
}

@Module({
  providers: [AiAnalysisService],
  exports: [AiAnalysisService],
})
export class AiAnalysisModule {}
