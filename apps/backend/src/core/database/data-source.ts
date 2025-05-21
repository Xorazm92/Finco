import { DataSource } from 'typeorm';
import { UserEntity } from '../../modules/v1/user/entities/user.entity';
import { UserChatRoleEntity } from '../../modules/v1/user/entities/user-chat-role.entity';
import { MessageLogEntity } from '../../modules/v1/message-log/entities/message-log.entity';
import { ReportTypeEntity } from '../../modules/v1/report/entities/report-type.entity';
import { ReportLogEntity } from '../../modules/v1/report/entities/report-log.entity';
import { KpiScoreEntity } from '../../modules/v1/kpi/entities/kpi-score.entity';
import { CompanyEntity } from '../../modules/v1/company/entities/company.entity';
import { UserCompanyAssignmentEntity } from '../../modules/v1/company/entities/user-company-assignment.entity';
import { KpiDefinitionEntity } from '../../modules/v1/kpi/entities/kpi-definition.entity';

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'finco_user',
  password: process.env.DB_PASSWORD || 'finco_pass',
  database: process.env.DB_DATABASE || 'finco_kpi',
  entities: [
    UserEntity,
    UserChatRoleEntity,
    MessageLogEntity,
    ReportTypeEntity,
    ReportLogEntity,
    KpiScoreEntity,
    CompanyEntity,
    UserCompanyAssignmentEntity,
    KpiDefinitionEntity,
  ],
  synchronize: false,
  migrations: ['dist/migrations/**/*.js'],
});
export default AppDataSource;
