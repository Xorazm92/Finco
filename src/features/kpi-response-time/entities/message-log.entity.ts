import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Index,
} from 'typeorm';
import { UserEntity } from '../../user-management/entities/user.entity';
import { UserRole } from '../../../shared/enums/user-role.enum';

export enum MessageStatus {
  PENDING_ANSWER = 'PENDING_ANSWER',
  ANSWERED = 'ANSWERED',
  CLOSED_TIMEOUT = 'CLOSED_TIMEOUT',
  CLOSED_BY_SUPERVISOR = 'CLOSED_BY_SUPERVISOR',
}

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

  @Column({ type: 'enum', enum: UserRole, nullable: true })
  senderRoleAtMoment?: UserRole;

  @Column({ name: 'sent_at', type: 'timestamp' })
  sentAt: Date;

  @Column({
    name: 'text_preview',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  textPreview?: string;

  @Column({ default: false })
  isClientQuestion: boolean;

  @Column({
    type: 'enum',
    enum: MessageStatus,
    default: MessageStatus.PENDING_ANSWER,
  })
  status: MessageStatus;

  @Column('simple-array', { nullable: true })
  questionKeywords?: string[];

  @Column({ name: 'replied_to_message_id', type: 'bigint', nullable: true })
  repliedToMessageId?: string;

  @ManyToOne(() => UserEntity, { nullable: true })
  replyByUser?: UserEntity;

  @Column({ type: 'enum', enum: UserRole, nullable: true })
  replyByRoleAtMoment?: UserRole;

  @Column({ name: 'replied_at', type: 'timestamp', nullable: true })
  repliedAt?: Date;

  @Column({ name: 'response_time_seconds', type: 'int', nullable: true })
  responseTimeSeconds?: number;

  @Column({ type: 'bigint', nullable: true })
  replyMessageId?: string;

  @Column({ type: 'varchar', nullable: true })
  replyDetectionMethod?:
    | 'REPLY'
    | 'TIME_WINDOW_SINGLE_PENDING'
    | 'TIME_WINDOW_MULTIPLE_PENDING_KEYWORD_MATCH'
    | 'SUPERVISOR_REVIEW'
    | 'SUPERVISOR_APPROVED'
    | 'SUPERVISOR_REJECTED';

  @Column({ type: 'float', nullable: true })
  confidenceScore?: number;

  @Column({ type: 'int', nullable: true })
  potentialReplyToMessageId?: number;
}
