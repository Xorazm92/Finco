import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from './user.entity';
import { UserRole } from '../../shared/enums/user-role.enum';

@Entity()
export class UserChatRole {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  user: User;

  @Column()
  chatId: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.AWAITING_APPROVAL,
  })
  role: UserRole;
}
