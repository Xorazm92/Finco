import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('audit_log')
export class AuditLogEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  action: string; // 'edit' | 'delete'

  @Column()
  kpiId: number;

  @Column()
  performedBy: number; // userId

  @Column({ nullable: true })
  oldValue: number;

  @Column({ nullable: true })
  oldComment: string;

  @Column({ nullable: true })
  newValue: number;

  @Column({ nullable: true })
  newComment: string;

  @Column({ nullable: true })
  reason: string;

  @CreateDateColumn()
  createdAt: Date;
}
