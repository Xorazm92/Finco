import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class MessageLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  telegramMessageId: number;

  @Column()
  telegramChatId: string;

  @Column()
  senderTelegramId: string;

  @Column()
  senderRoleAtMoment: string;

  @Column()
  sentAt: Date;

  @Column({ nullable: true })
  textContent: string;

  @Column({ nullable: true })
  isReplyToMessageId: number;

  @Column({ default: false })
  isQuestion: boolean;

  @Column({ nullable: true })
  questionStatus: string; // PENDING, ANSWERED

  @Column({ nullable: true })
  answeredByMessageId: number;

  @Column({ nullable: true, type: 'float' })
  responseTimeSeconds: number;
}
