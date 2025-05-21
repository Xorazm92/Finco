import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { UserEntity } from '../../user-management/entities/user.entity';
import { CompanyEntity } from '../../company/entities/company.entity';

@Entity('penalty')
export class PenaltyEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UserEntity)
  user: UserEntity;

  @ManyToOne(() => CompanyEntity)
  company: CompanyEntity;

  @Column('float')
  amount: number;

  @Column({ nullable: true })
  comment?: string;

  @CreateDateColumn()
  createdAt: Date;
}
