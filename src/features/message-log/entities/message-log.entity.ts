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

  @Column({ name: 'text_content', nullable: true })
  textContent: string | null;

  @Column({ name: 'is_reply_to_message_id', nullable: true })
  isReplyToMessageId: number | null;

  @Column({ name: 'has_attachments', default: false })
  hasAttachments: boolean;

  @Column({ name: 'attachment_type', nullable: true })
  attachmentType: string | null;

  // KPI uchun
  @Column({ name: 'is_question', default: false })
  isQuestion: boolean;

  @Column({ name: 'question_status', type: 'enum', enum: ['PENDING', 'ANSWERED', 'TIMEOUT'], default: 'PENDING' })
  questionStatus: 'PENDING' | 'ANSWERED' | 'TIMEOUT';

  @Column({ name: 'answered_by_message_id', nullable: true })
  answeredByMessageId: number | null;

  @Column({ name: 'response_time_seconds', nullable: true })
  responseTimeSeconds: number | null;

  @Column({ name: 'answer_detection_method', nullable: true })
  answerDetectionMethod: string | null;
}
