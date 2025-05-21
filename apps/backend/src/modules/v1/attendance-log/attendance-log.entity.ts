import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { UserEntity } from '../../user-management/entities/user.entity';

@Entity('attendance_logs')
export class AttendanceLogEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UserEntity, { eager: true })
  user: UserEntity;

  @Column()
  telegramChatId: string;

  @CreateDateColumn()
  checkinAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  checkoutAt: Date;

  @Column({ default: false })
  isLate: boolean;
}
