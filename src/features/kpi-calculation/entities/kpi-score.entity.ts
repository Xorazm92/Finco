
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('kpi_scores')
export class KpiScoreEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: string;

  @Column('json')
  period: {
    start: Date;
    end: Date;
  };

  @Column('int')
  totalMessages: number;

  @Column('float')
  responseTimeScore: number;

  @Column('float')
  qualityScore: number;

  @Column('float')
  finalScore: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
