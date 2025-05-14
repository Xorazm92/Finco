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
}
