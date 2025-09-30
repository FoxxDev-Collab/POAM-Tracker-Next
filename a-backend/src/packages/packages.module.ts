import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { PackagesService } from './packages.service';
import { PackagesController } from './packages.controller';
import { SystemsModule } from '../systems/systems.module';
import { GroupsModule } from '../groups/groups.module';
import * as multer from 'multer';

@Module({
  imports: [
    SystemsModule,
    GroupsModule,
    MulterModule.register({
      storage: multer.memoryStorage(),
      limits: {
        fileSize: 50 * 1024 * 1024, // 50MB limit for documents
      },
    }),
  ],
  controllers: [PackagesController],
  providers: [PackagesService],
  exports: [PackagesService],
})
export class PackagesModule {}
