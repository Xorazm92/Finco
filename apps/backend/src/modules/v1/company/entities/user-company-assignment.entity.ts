import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { UserEntity } from '../../user-management/entities/user.entity';
import { CompanyEntity } from './company.entity';

@Entity('user_company_assignment')
export class UserCompanyAssignmentEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UserEntity, (user) => user.assignments)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @ManyToOne(() => CompanyEntity, (company) => company.assignments)
  @JoinColumn({ name: 'company_id' })
  company: CompanyEntity;

  @Column({ name: 'role_in_company' })
  roleInCompany: string;

  @Column({
    name: 'salary_percentage_from_company',
    type: 'float',
    default: 100,
  })
  salaryPercentageFromCompany: number;
}
