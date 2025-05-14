import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';
import { UserRole } from '../../../shared/enums/user-role.enum';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column({ name: 'telegram_id', type: 'bigint', unique: true })
  telegramId: string;

  @Column({ name: 'first_name', type: 'varchar', length: 100 })
  firstName: string;

  @Column({ name: 'last_name', type: 'varchar', length: 100, nullable: true })
  lastName?: string;

  @Column({ name: 'username', type: 'varchar', length: 100, nullable: true })
  username?: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.BANK_CLIENT,
  })
  role: UserRole;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;
}
