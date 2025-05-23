
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('kpi_definitions')
export class KpiDefinitionEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'varchar', length: 50 })
  metricType: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  weight: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  targetValue: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
