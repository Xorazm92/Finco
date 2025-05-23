import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class HumanFeedback {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  aiResultId: number; // AiAnalysisResult.id

  @Column()
  supervisorId: string; // Telegram ID of supervisor

  @Column()
  feedback: string; // e.g. 'ACCEPTED', 'REJECTED', 'SKIPPED'

  @Column({ nullable: true })
  comment?: string;

  @CreateDateColumn()
  createdAt: Date;
}
