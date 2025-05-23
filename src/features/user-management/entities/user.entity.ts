import { Entity, PrimaryGeneratedColumn, Column, Index, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { UserChatRoleEntity } from './user-chat-role.entity';
import { UserCompanyAssignmentEntity } from '../../company/entities/user-company-assignment.entity';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column({ name: 'telegram_id', type: 'bigint', unique: true })
  telegramId: string;

  @Column({ name: 'first_name', type: 'varchar', length: 100, nullable: false })
  firstName: string;

  @Column({ name: 'last_name', type: 'varchar', length: 100, nullable: true })
  lastName?: string;

  @Index({ unique: true })
  @Column({ name: 'username', type: 'varchar', length: 100, unique: true, nullable: true })
  username?: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @OneToMany(() => UserChatRoleEntity, (ucr) => ucr.user)
  chatRoles: UserChatRoleEntity[];

  @OneToMany(() => UserCompanyAssignmentEntity, assignment => assignment.user)
  assignments: UserCompanyAssignmentEntity[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}