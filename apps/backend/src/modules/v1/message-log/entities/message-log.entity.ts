import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('message_log')
export class MessageLogEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'telegram_message_id' })
  telegramMessageId: number;

  @Column({ name: 'telegram_chat_id' })
  telegramChatId: number;

  @Column({ name: 'sender_telegram_id' })
  senderTelegramId: string;

  @Column({ name: 'sender_role_at_moment' })
  senderRoleAtMoment: string;

  @Column({ name: 'sent_at' })
  sentAt: Date;

  @Column({ name: 'text_content', type: 'text', nullable: true })
  textContent: string | null;

  @Column({ name: 'transcribed_text', type: 'text', nullable: true })
  transcribed_text?: string;

  @Column({ name: 'is_reply_to_message_id', type: 'bigint', nullable: true })
  isReplyToMessageId: number | null;

  @Column({ name: 'has_attachments', default: false })
  hasAttachments: boolean;

  @Column({ name: 'attachment_type', type: 'varchar', nullable: true })
  attachmentType: string | null;

  @Column({ name: 'is_question', default: false })
  isQuestion: boolean;

  @Column({ name: 'question_status', type: 'enum', enum: ['PENDING', 'ANSWERED', 'TIMEOUT'], default: 'PENDING' })
  questionStatus: 'PENDING' | 'ANSWERED' | 'TIMEOUT';

  @Column({ name: 'answered_by_message_id', type: 'bigint', nullable: true })
  answeredByMessageId: number | null;

  @Column({ name: 'response_time_seconds', type: 'integer', nullable: true })
  responseTimeSeconds: number | null;

  @Column({ name: 'answer_detection_method', type: 'varchar', nullable: true })
  answerDetectionMethod: string | null;
}