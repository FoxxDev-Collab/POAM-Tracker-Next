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
  UploadedFile,
  UseInterceptors,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { PackagesService } from './packages.service';
import { CreatePackageDto, UpdatePackageDto } from './dto';
import { SystemsService } from '../systems/systems.service';
import { GroupsService } from '../groups/groups.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Audit } from '../decorators/audit.decorator';

@Controller('packages')
@UseGuards(JwtAuthGuard)
export class PackagesController {
  constructor(
    private readonly packagesService: PackagesService,
    private readonly systemsService: SystemsService,
    private readonly groupsService: GroupsService,
  ) {}

  @Post()
  @Audit({ action: 'CREATE', resource: 'PACKAGE', sensitiveData: true })
  create(@Body() createPackageDto: CreatePackageDto) {
    return this.packagesService.create(createPackageDto);
  }

  @Get()
  findAll() {
    return this.packagesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.packagesService.findOne(id);
  }

  @Patch(':id')
  @Audit({ action: 'UPDATE', resource: 'PACKAGE', sensitiveData: true })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePackageDto: UpdatePackageDto,
  ) {
    return this.packagesService.update(id, updatePackageDto);
  }

  @Delete(':id')
  @Audit({ action: 'DELETE', resource: 'PACKAGE', sensitiveData: true })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.packagesService.remove(id);
  }

  // Package systems endpoints
  @Get(':id/systems')
  getPackageSystems(@Param('id', ParseIntPipe) id: number) {
    return this.systemsService.findByPackage(id);
  }

  // Package groups endpoints
  @Get(':id/groups')
  getPackageGroups(@Param('id', ParseIntPipe) id: number) {
    return this.groupsService.findByPackage(id);
  }

  // Package documents endpoints
  @Get(':id/documents')
  getPackageDocuments(@Param('id', ParseIntPipe) id: number) {
    return this.packagesService.getDocuments(id);
  }

  @Post(':id/documents/upload')
  @UseInterceptors(FileInterceptor('file'))
  @Audit({ action: 'CREATE', resource: 'PACKAGE_DOCUMENT', sensitiveData: false })
  async uploadDocument(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any
  ) {
    if (!file) {
      throw new Error('No file provided');
    }
    return this.packagesService.uploadDocument(id, file, body);
  }

  @Get(':id/documents/:documentId/download')
  async downloadDocument(
    @Param('id', ParseIntPipe) id: number,
    @Param('documentId') documentId: string,
    @Res() res: Response
  ) {
    return this.packagesService.downloadDocument(id, documentId, res);
  }

  @Delete(':id/documents/:documentId')
  @Audit({ action: 'DELETE', resource: 'PACKAGE_DOCUMENT', sensitiveData: false })
  deleteDocument(
    @Param('id', ParseIntPipe) id: number,
    @Param('documentId') documentId: string
  ) {
    return this.packagesService.deleteDocument(id, documentId);
  }
}
