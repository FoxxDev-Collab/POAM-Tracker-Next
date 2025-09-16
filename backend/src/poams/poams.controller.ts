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
import {
  CreatePoamDto,
  UpdatePoamDto,
  CreatePoamMilestoneDto,
  UpdatePoamMilestoneDto,
  CreatePoamCommentDto,
  CreatePoamEvidenceDto,
  CreatePoamReviewDto,
} from './dto';

@Controller('poams')
@UseGuards(JwtAuthGuard)
export class PoamsController {
  constructor(private readonly poamsService: PoamsService) {}

  @Post()
  create(@Body() createPoamDto: CreatePoamDto) {
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
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePoamDto: UpdatePoamDto,
  ) {
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
    @Body() createMilestoneDto: CreatePoamMilestoneDto,
  ) {
    return this.poamsService.createMilestone(id, createMilestoneDto);
  }

  @Patch('milestones/:milestoneId')
  updateMilestone(
    @Param('milestoneId', ParseIntPipe) id: number,
    @Body() updateMilestoneDto: UpdatePoamMilestoneDto,
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
    @Body() createCommentDto: CreatePoamCommentDto,
  ) {
    return this.poamsService.createComment(id, createCommentDto);
  }

  // Evidence endpoints
  @Get(':id/evidences')
  findEvidences(@Param('id', ParseIntPipe) id: number) {
    return this.poamsService.findEvidences(id);
  }

  @Post(':id/evidences')
  createEvidence(
    @Param('id', ParseIntPipe) id: number,
    @Body() createEvidenceDto: CreatePoamEvidenceDto,
  ) {
    return this.poamsService.createEvidence(id, createEvidenceDto);
  }

  @Delete('evidences/:evidenceId')
  deleteEvidence(@Param('evidenceId', ParseIntPipe) id: number) {
    return this.poamsService.deleteEvidence(id);
  }

  // Review endpoints
  @Get(':id/reviews')
  findReviews(@Param('id', ParseIntPipe) id: number) {
    return this.poamsService.findReviews(id);
  }

  @Post(':id/reviews')
  createReview(
    @Param('id', ParseIntPipe) id: number,
    @Body() createReviewDto: CreatePoamReviewDto,
  ) {
    return this.poamsService.createReview(id, createReviewDto);
  }

  // STPs endpoints
  @Get(':id/stps')
  findStps(@Param('id', ParseIntPipe) id: number) {
    return this.poamsService.findStps(id);
  }
}
