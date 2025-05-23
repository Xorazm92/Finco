
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { UserEntity } from '../../user-management/entities/user.entity';

@Entity('message_logs')
export class MessageLogEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'message_id', type: 'varchar' })
  messageId: string;

  @Column({ name: 'chat_id', type: 'varchar' })
  chatId: string;

  @Column({ name: 'text_content', type: 'text', nullable: true })
  textContent?: string;

  @Column({ name: 'is_question', type: 'boolean', default: false })
  isQuestion: boolean;

  @Column({ name: 'question_status', type: 'varchar', nullable: true })
  questionStatus?: 'PENDING' | 'ANSWERED' | 'TIMEOUT';

  @Column({ name: 'response_time_seconds', type: 'integer', nullable: true })
  responseTimeSeconds?: number;

  @Column({ name: 'answer_method', type: 'varchar', nullable: true })
  answerMethod?: string;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column({ name: 'user_id' })
  userId: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
