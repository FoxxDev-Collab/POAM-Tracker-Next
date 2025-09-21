import { Module } from '@nestjs/common';
import { CatalogService } from './catalog.service';
import { CatalogController } from './catalog.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { ControlComplianceService } from '../services/control-compliance.service';

@Module({
  imports: [PrismaModule],
  controllers: [CatalogController],
  providers: [CatalogService, ControlComplianceService],
  exports: [CatalogService, ControlComplianceService],
})
export class CatalogModule {}
