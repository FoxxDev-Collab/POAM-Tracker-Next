import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  UseGuards,
  ParseIntPipe,
  Query
} from '@nestjs/common';
import { SystemsService } from './systems.service';
import type { CreateSystemDto, UpdateSystemDto } from './systems.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('systems')
@UseGuards(JwtAuthGuard)
export class SystemsController {
  constructor(private readonly systemsService: SystemsService) {}

  @Post()
  create(@Body() createSystemDto: CreateSystemDto) {
    return this.systemsService.create(createSystemDto);
  }

  @Get()
  findAll(
    @Query('packageId') packageId?: string,
    @Query('groupId') groupId?: string
  ) {
    if (packageId) {
      return this.systemsService.findByPackage(parseInt(packageId));
    }
    if (groupId) {
      return this.systemsService.findByGroup(parseInt(groupId));
    }
    return this.systemsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.systemsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number, 
    @Body() updateSystemDto: UpdateSystemDto
  ) {
    return this.systemsService.update(id, updateSystemDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.systemsService.remove(id);
  }
}
