import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { UserCompanyAssignmentEntity } from './user-company-assignment.entity';

@Entity('company')
export class CompanyEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  inn: string;

  @Column({ name: 'nds_status', default: false })
  ndsStatus: boolean;

  @OneToMany(() => UserCompanyAssignmentEntity, assignment => assignment.company)
  assignments: UserCompanyAssignmentEntity[];
}
