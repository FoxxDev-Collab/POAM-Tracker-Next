import { Module } from '@nestjs/common';
import { PoamsController } from './poams.controller';
import { PoamsService } from './poams.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PoamsController],
  providers: [PoamsService],
  exports: [PoamsService],
})
export class PoamsModule {}
