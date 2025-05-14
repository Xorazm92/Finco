import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Index } from 'typeorm';
import { UserEntity } from '../../user-management/entities/user.entity';

@Entity('message_logs')
export class MessageLogEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'telegram_message_id', type: 'bigint' })
  telegramMessageId: string;

  @Column({ name: 'telegram_chat_id', type: 'bigint' })
  telegramChatId: string;

  @ManyToOne(() => UserEntity)
  senderUser: UserEntity;

  @Column({ name: 'sent_at', type: 'timestamp' })
  sentAt: Date;

  @Column({ name: 'text_preview', type: 'varchar', length: 255, nullable: true })
  textPreview?: string;

  @Column({ name: 'is_question_candidate', type: 'boolean', default: false })
  isQuestionCandidate: boolean;

  @Column({ name: 'replied_to_message_id', type: 'bigint', nullable: true })
  repliedToMessageId?: string;

  @ManyToOne(() => UserEntity, { nullable: true })
  replyByUser?: UserEntity;

  @Column({ name: 'replied_at', type: 'timestamp', nullable: true })
  repliedAt?: Date;

  @Column({ name: 'response_time_seconds', type: 'int', nullable: true })
  responseTimeSeconds?: number;
}
