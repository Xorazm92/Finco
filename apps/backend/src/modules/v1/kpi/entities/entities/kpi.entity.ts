import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { UserEntity } from '../../user-management/entities/user.entity';
import { KpiDefinitionEntity } from './kpi-definition.entity';

@Entity('kpi')
export class KpiEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @ManyToOne(() => UserEntity)
  user: UserEntity;

  @Column('float')
  value: number;

  @ManyToOne(() => KpiDefinitionEntity)
  @JoinColumn({ name: 'kpi_definition_id' })
  kpiDefinition: KpiDefinitionEntity;

  @Column({ name: 'kpi_definition_id', nullable: true })
  kpiDefinitionId?: number;

  @Column({ nullable: true })
  comment?: string;

  @CreateDateColumn()
  createdAt: Date;
}
