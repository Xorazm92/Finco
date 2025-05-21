import { Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserEntity } from '../../features/user-management/entities/user.entity';
import { UserCompanyAssignmentEntity } from '../../features/company/entities/user-company-assignment.entity';
import { CompanyEntity } from '../../features/company/entities/company.entity';
import { MessageLogEntity } from '../../features/message-log/entities/message-log.entity';
import { ReportTypeEntity } from '../../features/kpi-report-submission/entities/report-type.entity';
import { ReportLogEntity } from '../../features/kpi-report-submission/entities/report-log.entity';
import { KpiScoreEntity } from '../../features/kpi-calculation/entities/kpi-score.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService): TypeOrmModuleOptions => ({
        type: configService.get<string>('database.type') as 'postgres',
        host: configService.get<string>('database.host'),
        port: Number(configService.get<string>('database.port')),
        username: configService.get<string>('database.username'),
        password: configService.get<string>('database.password'),
        database: configService.get<string>('database.database'),
        entities: [
          UserEntity,
          UserCompanyAssignmentEntity,
          CompanyEntity,
          MessageLogEntity,
          ReportTypeEntity,
          ReportLogEntity,
          KpiScoreEntity,
        ],
        synchronize: false, // Use migrations only!
        autoLoadEntities: true,
      }),
    }),
  ],
})
export class DatabaseModule {}
