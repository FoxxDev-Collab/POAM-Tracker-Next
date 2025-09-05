import { Module } from '@nestjs/common';
import { PackagesService } from './packages.service';
import { PackagesController } from './packages.controller';
import { SystemsModule } from '../systems/systems.module';
import { GroupsModule } from '../groups/groups.module';

@Module({
  imports: [SystemsModule, GroupsModule],
  controllers: [PackagesController],
  providers: [PackagesService],
  exports: [PackagesService],
})
export class PackagesModule {}
