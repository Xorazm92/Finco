import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('audit_logs')
export class AuditLogEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  action: string; // e.g. 'KPI_UPDATED', 'ROLE_CHANGED', etc.

  @Column({ type: 'varchar', length: 100, nullable: true })
  performedBy: string; // userId or username

  @Column({ type: 'varchar', length: 100, nullable: true })
  affectedUser: string; // userId or username

  @Column({ type: 'text', nullable: true })
  details: string; // JSON.stringify of changes

  @CreateDateColumn()
  createdAt: Date;
}
