import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class AuditLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  action: string;

  @Column({ nullable: true })
  performedBy: string;

  @Column({ nullable: true })
  target: string;

  @Column({ type: 'json', nullable: true })
  details?: any;

  @CreateDateColumn()
  createdAt: Date;
}
