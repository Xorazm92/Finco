import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompanyEntity } from './entities/company.entity';
import { UserCompanyAssignmentEntity } from './entities/user-company-assignment.entity';
import { CompanyService } from './company.service';
import { UserCompanyAssignmentService } from './user-company-assignment.service';

@Module({
  imports: [TypeOrmModule.forFeature([CompanyEntity, UserCompanyAssignmentEntity])],
  providers: [CompanyService, UserCompanyAssignmentService],
  exports: [CompanyService, UserCompanyAssignmentService],
})
export class CompanyModule {}
