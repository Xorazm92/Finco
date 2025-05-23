
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

  @Column({ name: 'sender_telegram_id', type: 'varchar', nullable: true })
  senderTelegramId?: string;

  @Column({ name: 'sender_role_at_moment', type: 'varchar', nullable: true })
  senderRoleAtMoment?: string;

  @Column({ name: 'text_content', type: 'text', nullable: true })
  textContent?: string;

  @Column({ name: 'transcribed_text', type: 'text', nullable: true })
  transcribedText?: string;

  @Column({ name: 'is_question', type: 'boolean', default: false })
  isQuestion: boolean;

  @Column({ name: 'question_status', type: 'varchar', nullable: true })
  questionStatus?: 'PENDING' | 'ANSWERED' | 'TIMEOUT';

  @Column({ name: 'sent_at', type: 'timestamp' })
  sentAt: Date;

  @Column({ name: 'response_time_seconds', type: 'integer', nullable: true })
  responseTimeSeconds?: number;

  @Column({ name: 'answer_method', type: 'varchar', nullable: true })
  answerMethod?: string;

  @Column({ name: 'answer_detection_method', type: 'varchar', nullable: true })
  answerDetectionMethod?: string;

  @Column({ name: 'is_reply_to_message_id', type: 'varchar', nullable: true })
  isReplyToMessageId?: string;

  @Column({ name: 'answered_by_message_id', type: 'varchar', nullable: true })
  answeredByMessageId?: string;

  @Column({ name: 'has_attachments', type: 'boolean', default: false })
  hasAttachments: boolean;

  @Column({ name: 'attachment_type', type: 'varchar', nullable: true })
  attachmentType?: string;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column({ name: 'user_id' })
  userId: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
