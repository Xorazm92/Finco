import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { AiAnalysisResultEntity } from './ai-analysis-result.entity';

@Entity('human_feedback')
export class HumanFeedbackEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => AiAnalysisResultEntity)
  @JoinColumn({ name: 'ai_analysis_result_id' })
  aiAnalysisResult: AiAnalysisResultEntity;

  @Column()
  aiAnalysisResultId: number;

  @Column({ nullable: true })
  reviewerTelegramId?: string;

  @Column({ type: 'varchar', length: 16 })
  verdict: 'approved' | 'rejected' | 'corrected';

  @Column({ type: 'text', nullable: true })
  comment?: string;

  @CreateDateColumn()
  createdAt: Date;
}
