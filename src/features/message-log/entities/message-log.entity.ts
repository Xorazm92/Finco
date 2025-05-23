import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { UserEntity } from '../../user-management/entities/user.entity';

@Entity('message_logs')
export class MessageLogEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'chat_id', type: 'varchar' })
  chatId: string;

  @Column({ name: 'message_id', type: 'varchar' })
  messageId: string;

  @Column({ name: 'response_time_seconds', type: 'integer', nullable: true })
  responseTimeSeconds: number;

  @Column({ name: 'feedback', type: 'jsonb', nullable: true })
  feedback: {
    sentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
    score: number;
  };

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column({ name: 'user_id' })
  userId: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}