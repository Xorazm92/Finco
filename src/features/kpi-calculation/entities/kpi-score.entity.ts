
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { UserEntity } from '../../user-management/entities/user.entity';
import { KpiDefinitionEntity } from '../../kpi/entities/kpi-definition.entity';

@Entity('kpi_scores')
export class KpiScoreEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UserEntity)
  user: UserEntity;

  @Column()
  userId: number;

  @ManyToOne(() => KpiDefinitionEntity)
  kpiDefinition: KpiDefinitionEntity;

  @Column()
  kpiDefinitionId: number;

  @Column('decimal', { precision: 10, scale: 2 })
  score: number;

  @Column('decimal', { precision: 10, scale: 2 })
  weight: number;

  @Column('decimal', { precision: 10, scale: 2 })
  weightedScore: number;

  @Column({ type: 'date' })
  scoringPeriod: Date;

  @CreateDateColumn()
  createdAt: Date;
}
