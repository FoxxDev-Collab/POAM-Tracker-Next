import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  UseGuards,
  ParseIntPipe 
} from '@nestjs/common';
import { PackagesService } from './packages.service';
import type { CreatePackageDto, UpdatePackageDto } from './packages.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Audit } from '../decorators/audit.decorator';

@Controller('packages')
@UseGuards(JwtAuthGuard)
export class PackagesController {
  constructor(private readonly packagesService: PackagesService) {}

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
    @Body() updatePackageDto: UpdatePackageDto
  ) {
    return this.packagesService.update(id, updatePackageDto);
  }

  @Delete(':id')
  @Audit({ action: 'DELETE', resource: 'PACKAGE', sensitiveData: true })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.packagesService.remove(id);
  }
}
