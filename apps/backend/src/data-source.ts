import 'dotenv/config';
import { DataSource } from 'typeorm';
import { UserEntity } from './features/user-management/entities/user.entity';
import { UserChatRoleEntity } from './features/user-management/entities/user-chat-role.entity';

// Diagnostika uchun env qiymatlar
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('DB_USERNAME:', process.env.DB_USERNAME);
console.log(
  'DB_PASSWORD:',
  process.env.DB_PASSWORD,
  typeof process.env.DB_PASSWORD,
);
console.log('DB_DATABASE:', process.env.DB_DATABASE);

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [
    UserEntity,
    UserChatRoleEntity,
    // boshqa entitylar
  ],
  migrations: [__dirname + '/migrations/*.{ts,js}'],
  synchronize: false,
});
