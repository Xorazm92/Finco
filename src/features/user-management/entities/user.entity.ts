import { Entity, PrimaryGeneratedColumn, Column, Index, OneToMany } from 'typeorm';
import { UserChatRoleEntity } from './user-chat-role.entity';
import { UserRole } from '../../../shared/enums/user-role.enum';

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
  @Column({ name: 'username', type: 'varchar', length: 100, unique: true, nullable: false })
  username: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.CLIENT, // Agar bazada 'BANK_CLIENT' bo‘lsa, enum va defaultni moslashtiring
  })
  role: UserRole;

  @Column({ name: 'password', type: 'varchar', length: 255, nullable: false })
  password: string;

  @Column({ name: 'chat_id', type: 'bigint', default: 0 })
  chatId: string;

  // Guruh rollari endi alohida UserChatRoleEntity da saqlanadi
  @OneToMany(() => UserChatRoleEntity, (ucr) => ucr.user)
  chatRoles: UserChatRoleEntity[];

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ name: 'updated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
