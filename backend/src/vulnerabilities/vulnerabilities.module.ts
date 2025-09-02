import { Module } from '@nestjs/common';
import { VulnerabilitiesController, SystemsStigController } from './vulnerabilities.controller';
import { VulnerabilitiesService } from './vulnerabilities.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [VulnerabilitiesController, SystemsStigController],
  providers: [VulnerabilitiesService],
  exports: [VulnerabilitiesService],
})
export class VulnerabilitiesModule {}
