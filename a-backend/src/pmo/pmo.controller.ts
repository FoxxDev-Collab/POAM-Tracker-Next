import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { PmoService } from './pmo.service';
import { CreatePmoDto, UpdatePmoDto } from './dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@Controller('pmo')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PmoController {
  constructor(private readonly pmoService: PmoService) {}

  @Post()
  @Roles('Admin')
  create(@Body() createPmoDto: CreatePmoDto) {
    return this.pmoService.create(createPmoDto);
  }

  @Get()
  findAll() {
    return this.pmoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.pmoService.findOne(id);
  }

  @Get(':id/users')
  getUsersInPmo(@Param('id', ParseIntPipe) id: number) {
    return this.pmoService.getUsersInPmo(id);
  }

  @Patch(':id')
  @Roles('Admin')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePmoDto: UpdatePmoDto,
  ) {
    return this.pmoService.update(id, updatePmoDto);
  }

  @Delete(':id')
  @Roles('Admin')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.pmoService.remove(id);
  }
}
