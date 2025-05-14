import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { UserEntity } from '../../user-management/entities/user.entity';
import { ReportTypeEntity } from './report-type.entity';

@Entity('report_logs')
export class ReportLogEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => ReportTypeEntity, { eager: true })
  reportType: ReportTypeEntity;

  @Column()
  telegramChatId: string;

  @ManyToOne(() => UserEntity, { eager: true })
  submittedByUser: UserEntity;

  @CreateDateColumn()
  submittedAt: Date;

  @Column({ nullable: true })
  fileTelegramId: string;

  @Column({ nullable: true })
  fileName: string;

  @Column({ type: 'date', nullable: true })
  periodStartDate: Date;

  @Column({ type: 'date', nullable: true })
  periodEndDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  deadlineAt: Date;

  @Column({ default: 'PENDING' })
  status: string;
}
