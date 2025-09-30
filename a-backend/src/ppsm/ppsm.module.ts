import { Module } from '@nestjs/common';
import { PpsmController } from './ppsm.controller';
import { PpsmService } from './ppsm.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PpsmController],
  providers: [PpsmService],
  exports: [PpsmService],
})
export class PpsmModule {}