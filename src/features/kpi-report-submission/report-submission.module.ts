import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportLogEntity } from './entities/report-log.entity';
import { ReportTypeEntity } from './entities/report-type.entity';
import { ReportSubmissionService } from './report-submission.service';
import { ReportCommandListener } from './listeners/report-command.listener';
import { UserEntity } from '../user-management/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ReportLogEntity, ReportTypeEntity, UserEntity]),
  ],
  providers: [ReportSubmissionService, ReportCommandListener],
  exports: [ReportSubmissionService],
})
export class ReportSubmissionModule {}
