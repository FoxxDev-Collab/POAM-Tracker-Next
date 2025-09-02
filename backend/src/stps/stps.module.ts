import { Module } from '@nestjs/common';
import { StpsController } from './stps.controller';
import { StpsService } from './stps.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [StpsController],
  providers: [StpsService],
  exports: [StpsService],
})
export class StpsModule {}
