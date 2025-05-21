import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  type: process.env.DB_TYPE || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'finco_user',
  password: process.env.DB_PASSWORD || 'finco_pass',
  database: process.env.DB_DATABASE || 'finco_kpi',
  synchronize: false, // Always use migrations in production
  autoLoadEntities: true,
}));
