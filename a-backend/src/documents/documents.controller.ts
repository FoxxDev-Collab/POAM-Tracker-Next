import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UploadedFile,
  UseInterceptors,
  ParseIntPipe,
  Res,
  BadRequestException,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { DocumentsService } from './documents.service';
import { diskStorage } from 'multer';
import { existsSync, mkdirSync, readFileSync } from 'fs';
import { join } from 'path';
import * as crypto from 'crypto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/user.decorator';

const storage = diskStorage({
  destination: (req, file, cb) => {
    const packageId = req.body.packageId || 'default';
    const controlFamily = req.body.controlFamily || 'general';
    const documentType = req.body.documentType?.toLowerCase() || 'general';

    const uploadPath = join(
      process.cwd(),
      'uploads',
      'packages',
      String(packageId),
      'documents',
      String(controlFamily),
      String(documentType)
    );

    // Create directory if it doesn't exist
    if (!existsSync(uploadPath)) {
      mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const randomString = crypto.randomBytes(8).toString('hex');
    const extension = file.originalname.split('.').pop();
    const filename = `${timestamp}-${randomString}.${extension}`;
    cb(null, filename);
  },
});

@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get('categories')
  async getCategories() {
    return this.documentsService.getCategories();
  }

  @Get('package/:packageId')
  async getPackageDocuments(
    @Param('packageId', ParseIntPipe) packageId: number,
    @Query('controlFamily') controlFamily?: string,
    @Query('documentType') documentType?: string,
  ) {
    return this.documentsService.getPackageDocuments(
      packageId,
      controlFamily,
      documentType,
    );
  }

  @Get('package/:packageId/stats')
  async getPackageDocumentStats(
    @Param('packageId', ParseIntPipe) packageId: number,
  ) {
    return this.documentsService.getPackageDocumentStats(packageId);
  }

  @Get('package/:packageId/recent')
  async getRecentDocuments(
    @Param('packageId', ParseIntPipe) packageId: number,
    @Query('limit') limit?: string,
  ) {
    return this.documentsService.getRecentDocuments(
      packageId,
      limit ? parseInt(limit) : 10,
    );
  }

  @Get(':documentId/versions')
  async getDocumentVersions(@Param('documentId', ParseIntPipe) documentId: number) {
    return this.documentsService.getDocumentVersions(documentId);
  }

  @Get('version/:versionId')
  async getDocumentVersion(@Param('versionId', ParseIntPipe) versionId: number) {
    return this.documentsService.getDocumentVersion(versionId);
  }

  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file', { storage }))
  async uploadDocument(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: any,
    @Body() body: {
      packageId: string;
      controlFamily: string;
      documentType: string;
      documentSubType?: string;
      title: string;
      description?: string;
      changeNotes?: string;
      existingDocumentId?: string;
    },
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Calculate file checksum from the saved file
    const fileBuffer = readFileSync(file.path);
    const checksum = crypto
      .createHash('sha256')
      .update(fileBuffer)
      .digest('hex');

    return this.documentsService.uploadDocument({
      packageId: parseInt(body.packageId),
      controlFamily: body.controlFamily,
      documentType: body.documentType as any,
      documentSubType: body.documentSubType,
      title: body.title,
      description: body.description,
      changeNotes: body.changeNotes,
      existingDocumentId: body.existingDocumentId ? parseInt(body.existingDocumentId) : undefined,
      file: {
        filename: file.filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        path: file.path,
        checksum,
      },
      uploadedBy: parseInt(user.id),
    });
  }

  @Get('download/:versionId')
  async downloadDocument(
    @Param('versionId', ParseIntPipe) versionId: number,
    @Res() res: Response,
  ) {
    const version = await this.documentsService.getDocumentVersion(versionId);

    if (!version) {
      throw new NotFoundException('Document version not found');
    }

    const filePath = version.filePath;

    if (!existsSync(filePath)) {
      throw new NotFoundException('File not found on server');
    }

    res.download(filePath, version.fileName);
  }

  @Put(':documentId/approve')
  @UseGuards(JwtAuthGuard)
  async approveDocument(
    @Param('documentId', ParseIntPipe) documentId: number,
    @CurrentUser() user: any,
    @Body() body: { versionId: number; notes?: string },
  ) {
    return this.documentsService.approveDocument(
      documentId,
      body.versionId,
      parseInt(user.id),
      body.notes,
    );
  }

  @Put(':documentId/reject')
  @UseGuards(JwtAuthGuard)
  async rejectDocument(
    @Param('documentId', ParseIntPipe) documentId: number,
    @CurrentUser() user: any,
    @Body() body: { versionId: number; reason: string },
  ) {
    return this.documentsService.rejectDocument(
      documentId,
      body.versionId,
      parseInt(user.id),
      body.reason,
    );
  }

  @Delete(':documentId')
  async deleteDocument(@Param('documentId', ParseIntPipe) documentId: number) {
    return this.documentsService.deleteDocument(documentId);
  }
}