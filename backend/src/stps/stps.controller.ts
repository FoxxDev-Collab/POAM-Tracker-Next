import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { StpsService } from './stps.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('stps')
@UseGuards(JwtAuthGuard)
export class StpsController {
  constructor(private readonly stpsService: StpsService) {}

  @Post()
  create(@Body() createStpDto: any) {
    return this.stpsService.create(createStpDto);
  }

  @Get()
  findAll(
    @Query('package_id') packageId?: string,
    @Query('system_id') systemId?: string,
  ) {
    return this.stpsService.findAll(
      packageId ? parseInt(packageId) : undefined,
      systemId ? parseInt(systemId) : undefined,
    );
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.stpsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateStpDto: any) {
    return this.stpsService.update(id, updateStpDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.stpsService.remove(id);
  }

  @Get(':id/test-cases')
  findTestCases(@Param('id', ParseIntPipe) id: number) {
    return this.stpsService.findTestCases(id);
  }

  @Post(':id/test-cases')
  createTestCase(@Param('id', ParseIntPipe) id: number, @Body() createTestCaseDto: any) {
    return this.stpsService.createTestCase(id, createTestCaseDto);
  }

  @Patch('test-cases/:testCaseId')
  updateTestCase(@Param('testCaseId', ParseIntPipe) id: number, @Body() updateTestCaseDto: any) {
    return this.stpsService.updateTestCase(id, updateTestCaseDto);
  }

  @Delete('test-cases/:testCaseId')
  deleteTestCase(@Param('testCaseId', ParseIntPipe) id: number) {
    return this.stpsService.deleteTestCase(id);
  }
}
