import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { UserEntity } from '../../user-management/entities/user.entity';

@Entity('kpi_scores')
export class KpiScoreEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column({ name: 'kpi_metric_code', type: 'varchar', length: 100 })
  kpiMetricCode: string; // Masalan: "AVG_RESPONSE_TIME"

  @Column({ name: 'score_value', type: 'float' })
  scoreValue: number;

  @Column({ name: 'period_start_date', type: 'date' })
  periodStartDate: Date;

  @Column({ name: 'period_end_date', type: 'date' })
  periodEndDate: Date;

  @Column({ name: 'calculated_at', type: 'timestamp' })
  calculatedAt: Date;
}
