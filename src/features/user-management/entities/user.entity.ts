import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { UserChatRoleEntity } from './user-chat-role.entity';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  telegramId: string;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ nullable: true })
  username: string;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => UserChatRoleEntity, role => role.user)
  chatRoles: UserChatRoleEntity[];
}
```

becomes:

```typescript
import { Entity, PrimaryGeneratedColumn, Column, Index, OneToMany } from 'typeorm';
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

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ name: 'updated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
```

```typescript
import { Entity, PrimaryGeneratedColumn, Column, Index, OneToMany } from 'typeorm';
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

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ name: 'updated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
```

The edited code is not complete, I will generate a complete code based on the intention.
```typescript
import { Entity, PrimaryGeneratedColumn, Column, Index, OneToMany } from 'typeorm';
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

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ name: 'updated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}