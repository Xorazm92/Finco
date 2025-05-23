import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AiAnalysisResult } from './ai-analysis-result.entity';

@Injectable()
export class AiAnalysisService {
  constructor(
    @InjectRepository(AiAnalysisResult)
    private readonly aiAnalysisResultRepo: Repository<AiAnalysisResult>,
  ) {}

  async analyzeSentiment(messageId: number, chatId: string, text: string): Promise<AiAnalysisResult> {
    const entity = this.aiAnalysisResultRepo.create({
      messageId,
      chatId,
      resultType: 'SENTIMENT',
      value: text,
    });
    return await this.aiAnalysisResultRepo.save(entity);
  }

  async analyzeIsReply(messageId: number, chatId: string, text: string, context: string): Promise<AiAnalysisResult> {
    const entity = this.aiAnalysisResultRepo.create({
      messageId,
      chatId,
      resultType: 'IS_REPLY',
      value: { text, context },
    });
    return await this.aiAnalysisResultRepo.save(entity);
  }

  async findLatest(limit: number = 20): Promise<AiAnalysisResult[]> {
    return this.aiAnalysisResultRepo.find({
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }
}
