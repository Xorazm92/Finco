import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('payroll_audit_log')
export class PayrollAuditLogEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  action: string; // e.g. 'create', 'update', 'delete'

  @Column({ nullable: true })
  entityType: string; // 'bonus', 'advance', 'penalty'

  @Column({ nullable: true })
  entityId: number;

  @Column({ nullable: true })
  performedBy: number;

  @Column({ type: 'json', nullable: true })
  oldValue: any;

  @Column({ type: 'json', nullable: true })
  newValue: any;

  @Column({ nullable: true })
  comment: string;

  @CreateDateColumn()
  createdAt: Date;
}
