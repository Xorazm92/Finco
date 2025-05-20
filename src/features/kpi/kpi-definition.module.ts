import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KpiDefinitionEntity } from './entities/kpi-definition.entity';
import { KpiDefinitionService } from './kpi-definition.service';

@Module({
  imports: [TypeOrmModule.forFeature([KpiDefinitionEntity])],
  providers: [KpiDefinitionService],
  exports: [KpiDefinitionService],
})
export class KpiDefinitionModule {}
