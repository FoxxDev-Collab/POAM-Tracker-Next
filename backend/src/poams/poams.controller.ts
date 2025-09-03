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
} from '@nestjs/common';
import { PoamsService } from './poams.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('poams')
@UseGuards(JwtAuthGuard)
export class PoamsController {
  constructor(private readonly poamsService: PoamsService) {}

  @Post()
  create(@Body() createPoamDto: any) {
    return this.poamsService.create(createPoamDto);
  }

  @Get()
  findAll(
    @Query('package_id') packageId?: string,
    @Query('group_id') groupId?: string,
  ) {
    return this.poamsService.findAll(
      packageId ? parseInt(packageId) : undefined,
      groupId ? parseInt(groupId) : undefined,
    );
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.poamsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updatePoamDto: any) {
    return this.poamsService.update(id, updatePoamDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.poamsService.remove(id);
  }

  // Milestones endpoints
  @Get(':id/milestones')
  findMilestones(@Param('id', ParseIntPipe) id: number) {
    return this.poamsService.findMilestones(id);
  }

  @Post(':id/milestones')
  createMilestone(
    @Param('id', ParseIntPipe) id: number,
    @Body() createMilestoneDto: any,
  ) {
    return this.poamsService.createMilestone(id, createMilestoneDto);
  }

  @Patch('milestones/:milestoneId')
  updateMilestone(
    @Param('milestoneId', ParseIntPipe) id: number,
    @Body() updateMilestoneDto: any,
  ) {
    return this.poamsService.updateMilestone(id, updateMilestoneDto);
  }

  @Delete('milestones/:milestoneId')
  deleteMilestone(@Param('milestoneId', ParseIntPipe) id: number) {
    return this.poamsService.deleteMilestone(id);
  }

  // Comments endpoints
  @Get(':id/comments')
  findComments(@Param('id', ParseIntPipe) id: number) {
    return this.poamsService.findComments(id);
  }

  @Post(':id/comments')
  createComment(
    @Param('id', ParseIntPipe) id: number,
    @Body() createCommentDto: any,
  ) {
    return this.poamsService.createComment(id, createCommentDto);
  }
}
