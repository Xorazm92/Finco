import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('kpi_definition')
export class KpiDefinitionEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  code: string;

  @Column()
  description: string;

  @Column({ name: 'measurement_unit' })
  measurementUnit: string;

  @Column({ name: 'target_value', type: 'float', nullable: true })
  targetValue: number;

  @Column({ name: 'weight_in_overall_kpi', type: 'float', default: 1.0 })
  weightInOverallKpi: number;

  @Column({ name: 'calculation_logic_type' })
  calculationLogicType: string;
}
