import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('ai_analysis_result')
export class AiAnalysisResultEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  type: string; // e.g. 'sentiment', 'topic', etc.

  @Column('text')
  inputText: string;

  @Column('jsonb')
  result: any;

  @Column({ nullable: true })
  promptVersion?: string;

  @Column({ nullable: true })
  llmModel?: string;

  @Column({ nullable: true })
  llmParams?: string;

  @Column({ nullable: true })
  jobId?: string;

  @CreateDateColumn()
  createdAt: Date;
}
