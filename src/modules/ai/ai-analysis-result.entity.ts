import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class AiAnalysisResult {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  messageId: number;

  @Column()
  chatId: string;

  @Column()
  resultType: string; // e.g. 'SENTIMENT', 'IS_REPLY'

  @Column('jsonb')
  value: any; // AI natijasi (sentiment, boolean, text va h.k.)

  @CreateDateColumn()
  createdAt: Date;
}
