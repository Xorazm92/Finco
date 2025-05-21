import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('report_types')
export class ReportTypeEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  code: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'int', nullable: true })
  deadlineMinutes: number; // deadline (soatda yoki minutda)

  @Column('simple-array', { nullable: true })
  responsibleRoles: string[]; // mas’ul rollar (UserRole enum stringlari)

  @Column('simple-array', { nullable: true })
  hashtags: string[]; // hisobot uchun hashtaglar
}
