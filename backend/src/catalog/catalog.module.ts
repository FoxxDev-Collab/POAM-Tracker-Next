import { Module } from '@nestjs/common';
import { CatalogService } from './catalog.service';
import { CatalogController } from './catalog.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { ControlComplianceService } from '../services/control-compliance.service';
import { PackageBaselineService } from './package-baseline.service';

@Module({
  imports: [PrismaModule],
  controllers: [CatalogController],
  providers: [CatalogService, ControlComplianceService, PackageBaselineService],
  exports: [CatalogService, ControlComplianceService, PackageBaselineService],
})
export class CatalogModule {}
