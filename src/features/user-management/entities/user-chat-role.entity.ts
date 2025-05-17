import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { UserEntity } from './user.entity';
import { UserRole } from '../../../shared/enums/user-role.enum';

@Entity('user_chat_roles')
export class UserChatRoleEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UserEntity, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column({ name: 'user_id', type: 'int' })
  userId: number;

  @Column({ name: 'chat_id', type: 'bigint' })
  chatId: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.CLIENT,
  })
  role: UserRole;

  @Column({ name: 'assigned_by', type: 'bigint', nullable: true })
  assignedBy?: string;

  @CreateDateColumn({ name: 'assigned_at' })
  assignedAt: Date;
}
