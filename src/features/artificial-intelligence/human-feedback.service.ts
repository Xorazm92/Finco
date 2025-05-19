import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HumanFeedbackEntity } from './entities/human-feedback.entity';

@Injectable()
export class HumanFeedbackService {
  constructor(
    @InjectRepository(HumanFeedbackEntity)
    private readonly feedbackRepo: Repository<HumanFeedbackEntity>,
  ) {}

  async addFeedback(data: Partial<HumanFeedbackEntity>) {
    const entity = this.feedbackRepo.create(data);
    return this.feedbackRepo.save(entity);
  }

  async findByResultId(aiAnalysisResultId: number) {
    return this.feedbackRepo.find({
      where: { aiAnalysisResultId },
      order: { createdAt: 'DESC' },
    });
  }

  async findLatest(limit = 20) {
    return this.feedbackRepo.find({
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async countByVerdict(verdict: 'approved' | 'rejected' | 'corrected') {
    return this.feedbackRepo.count({ where: { verdict } });
  }
}
