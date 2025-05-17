import { Entity, PrimaryGeneratedColumn, Column, Index, OneToMany } from 'typeorm';
import { UserChatRoleEntity } from './user-chat-role.entity';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column({ name: 'telegram_id', type: 'bigint', unique: true })
  telegramId: string;

  @Column({ name: 'first_name', type: 'varchar', length: 100, nullable: true })
  firstName?: string;

  @Column({ name: 'last_name', type: 'varchar', length: 100, nullable: true })
  lastName?: string;

  @Column({ name: 'username', type: 'varchar', length: 100, nullable: true })
  username?: string;

  // Guruh rollari endi alohida UserChatRoleEntity da saqlanadi
  @OneToMany(() => UserChatRoleEntity, (ucr) => ucr.user)
  chatRoles: UserChatRoleEntity[];

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;
}
