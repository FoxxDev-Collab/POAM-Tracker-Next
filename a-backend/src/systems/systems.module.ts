import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { SystemsService } from './systems.service';
import { SystemsController } from './systems.controller';
import * as multer from 'multer';

@Module({
  imports: [
    MulterModule.register({
      storage: multer.memoryStorage(),
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
      },
    }),
  ],
  controllers: [SystemsController],
  providers: [SystemsService],
  exports: [SystemsService],
})
export class SystemsModule {}
