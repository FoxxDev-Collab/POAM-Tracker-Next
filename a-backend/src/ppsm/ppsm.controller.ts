import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PpsmService } from './ppsm.service';

@Controller('ppsm')
export class PpsmController {
  constructor(private readonly ppsmService: PpsmService) {}

  @Get('package/:packageId')
  async getPackagePPSM(@Param('packageId', ParseIntPipe) packageId: number) {
    return this.ppsmService.getPackagePPSM(packageId);
  }

  @Get('system/:systemId')
  async getSystemPPSM(@Param('systemId', ParseIntPipe) systemId: number) {
    return this.ppsmService.getSystemPPSM(systemId);
  }

  @Get(':id')
  async getPPSMById(@Param('id', ParseIntPipe) id: number) {
    const ppsm = await this.ppsmService.getPPSMById(id);
    if (!ppsm) {
      throw new NotFoundException('PPSM entry not found');
    }
    return ppsm;
  }

  @Post()
  async createPPSM(@Body() data: any) {
    if (!data.systemId || !data.port || !data.protocol || !data.service) {
      throw new BadRequestException('Missing required fields');
    }
    return this.ppsmService.createPPSM(data);
  }

  @Put(':id')
  async updatePPSM(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: any,
  ) {
    const ppsm = await this.ppsmService.getPPSMById(id);
    if (!ppsm) {
      throw new NotFoundException('PPSM entry not found');
    }
    return this.ppsmService.updatePPSM(id, data);
  }

  @Delete(':id')
  async deletePPSM(@Param('id', ParseIntPipe) id: number) {
    const ppsm = await this.ppsmService.getPPSMById(id);
    if (!ppsm) {
      throw new NotFoundException('PPSM entry not found');
    }
    return this.ppsmService.deletePPSM(id);
  }

  @Put(':id/approve')
  async approvePPSM(@Param('id', ParseIntPipe) id: number) {
    return this.ppsmService.approvePPSM(id);
  }

  @Put(':id/reject')
  async rejectPPSM(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { reason?: string },
  ) {
    return this.ppsmService.rejectPPSM(id, body.reason);
  }
}