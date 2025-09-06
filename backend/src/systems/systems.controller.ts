import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SystemsService } from './systems.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateSystemDto, UpdateSystemDto } from './dto';

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
    @Query('groupId') groupId?: string,
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
    @Body() updateSystemDto: UpdateSystemDto,
  ) {
    return this.systemsService.update(id, updateSystemDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.systemsService.remove(id);
  }

  // STIG-related endpoints
  @Get(':id/stig/findings')
  getStigFindings(@Param('id', ParseIntPipe) id: number) {
    return this.systemsService.getStigFindings(id);
  }

  @Get(':id/stig/scans')
  getStigScans(@Param('id', ParseIntPipe) id: number) {
    return this.systemsService.getStigScans(id);
  }

  @Post(':id/stig/upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadStigFile(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.systemsService.uploadStigFile(id, file);
  }
}
