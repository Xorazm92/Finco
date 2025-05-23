import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { UserEntity } from './user.entity';
import { UserRole } from '../../../shared/enums/user-role.enum';

@Entity('user_chat_roles')
export class UserChatRoleEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  chatId: number;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.CLIENT })
  role: UserRole;

  @ManyToOne(() => UserEntity, user => user.chatRoles)
  @JoinColumn({ name: 'userId' })
  user: UserEntity;
}