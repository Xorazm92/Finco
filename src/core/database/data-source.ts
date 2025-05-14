import { DataSource } from 'typeorm';
import { UserEntity } from '../../features/user-management/entities/user.entity';
import { MessageLogEntity } from '../../features/kpi-response-time/entities/message-log.entity';
import { ReportTypeEntity } from '../../features/kpi-report-submission/entities/report-type.entity';
import { ReportLogEntity } from '../../features/kpi-report-submission/entities/report-log.entity';
import { KpiScoreEntity } from '../../features/kpi-calculation/entities/kpi-score.entity';

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'finco_user',
  password: process.env.DB_PASSWORD || 'finco_pass',
  database: process.env.DB_DATABASE || 'finco_kpi',
  entities: [
    UserEntity,
    MessageLogEntity,
    ReportTypeEntity,
    ReportLogEntity,
    KpiScoreEntity,
  ],
  synchronize: false,
  migrations: ['dist/migrations/**/*.js'],
});
export default AppDataSource;
