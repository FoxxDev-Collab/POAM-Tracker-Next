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
import { StpsService } from './stps.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { 
  CreateStpDto, 
  UpdateStpDto, 
  CreateTestCaseDto, 
  UpdateTestCaseDto, 
  UploadTestCaseEvidenceDto,
  AddTestCaseCommentDto 
} from './dto';

@Controller('stps')
@UseGuards(JwtAuthGuard)
export class StpsController {
  constructor(private readonly stpsService: StpsService) {}

  @Post()
  create(@Body() createStpDto: CreateStpDto) {
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
  update(@Param('id', ParseIntPipe) id: number, @Body() updateStpDto: UpdateStpDto) {
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
  createTestCase(
    @Param('id', ParseIntPipe) id: number,
    @Body() createTestCaseDto: CreateTestCaseDto,
  ) {
    return this.stpsService.createTestCase(id, createTestCaseDto);
  }

  @Patch('test-cases/:testCaseId')
  updateTestCase(
    @Param('testCaseId', ParseIntPipe) id: number,
    @Body() updateTestCaseDto: UpdateTestCaseDto,
  ) {
    return this.stpsService.updateTestCase(id, updateTestCaseDto);
  }

  @Delete('test-cases/:testCaseId')
  deleteTestCase(@Param('testCaseId', ParseIntPipe) id: number) {
    return this.stpsService.deleteTestCase(id);
  }

  @Get('test-cases/:testCaseId/evidence')
  getTestCaseEvidence(@Param('testCaseId', ParseIntPipe) testCaseId: number) {
    return this.stpsService.getTestCaseEvidence(testCaseId);
  }

  @Post('test-cases/:testCaseId/evidence')
  uploadTestCaseEvidence(
    @Param('testCaseId', ParseIntPipe) testCaseId: number,
    @Body() uploadData: UploadTestCaseEvidenceDto, // This will be handled by multer middleware
  ) {
    // For now, return a mock response
    // This should be implemented with proper file upload handling
    return this.stpsService.uploadTestCaseEvidence(
      testCaseId,
      uploadData.filename,
      uploadData.originalFilename,
      uploadData.fileSize,
      uploadData.mimeType || 'application/octet-stream',
      uploadData.description || '',
      uploadData.uploadedBy,
    );
  }

  @Get('test-cases/:testCaseId/comments')
  getTestCaseComments(@Param('testCaseId', ParseIntPipe) testCaseId: number) {
    return this.stpsService.getTestCaseComments(testCaseId);
  }

  @Post('test-cases/:testCaseId/comments')
  addTestCaseComment(
    @Param('testCaseId', ParseIntPipe) testCaseId: number,
    @Body() commentDto: AddTestCaseCommentDto,
  ) {
    return this.stpsService.addTestCaseComment(
      testCaseId,
      commentDto.content,
      1, // TODO: Get from auth
    );
  }
}
