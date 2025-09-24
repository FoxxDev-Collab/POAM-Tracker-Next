import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FileManagerService {
  constructor(private prisma: PrismaService) {}

  async uploadFile(file: Express.Multer.File, body: any) {
    const uploadDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, file.filename);
    fs.renameSync(file.path, filePath);

    const fileRecord = await this.prisma.file.create({
      data: {
        filename: file.filename,
        originalFilename: file.originalname,
        fileSize: file.size,
        mimeType: file.mimetype,
        filePath,
        description: body.description || '',
        uploadedBy: body.uploadedBy || 1, // TODO: get from auth context
      },
    });

    // Create audit log
    await this.prisma.fileAuditLog.create({
      data: {
        fileId: fileRecord.id,
        action: 'UPLOADED',
        userId: body.uploadedBy || 1,
        details: 'File uploaded',
      },
    });

    // Create association if provided
    if (body.stpId) {
      await this.prisma.fileAssociation.create({
        data: {
          fileId: fileRecord.id,
          associationType: 'STP_EVIDENCE',
          stpId: parseInt(body.stpId),
          description: body.description,
        },
      });
    }

    return fileRecord;
  }

  async getAllFiles() {
    return this.prisma.file.findMany({
      include: {
        uploader: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        associations: {
          include: {
            stp: {
              select: {
                id: true,
                title: true,
              },
            },
            testCase: {
              select: {
                id: true,
                title: true,
              },
            },
            poam: {
              select: {
                id: true,
                title: true,
              },
            },
            system: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        _count: {
          select: {
            versions: true,
          },
        },
      },
      orderBy: {
        uploadedAt: 'desc',
      },
    });
  }

  async getFileById(id: string) {
    return this.prisma.file.findUnique({
      where: { id: parseInt(id) },
      include: {
        uploader: true,
        associations: true,
        versions: {
          orderBy: {
            version: 'desc',
          },
        },
        auditLogs: {
          orderBy: {
            timestamp: 'desc',
          },
        },
      },
    });
  }

  async updateFile(id: string, updateData: any) {
    const fileId = parseInt(id);
    const file = await this.prisma.file.findUnique({ where: { id: fileId } });
    if (!file) throw new Error('File not found');

    // Create new version if file content changed
    if (updateData.newFile) {
      const latestVersion = await this.prisma.fileVersion.findFirst({
        where: { fileId },
        orderBy: { version: 'desc' },
      });
      const newVersion = (latestVersion?.version || 0) + 1;

      const versionPath = path.join(process.cwd(), 'uploads', `v${newVersion}_${file.filename}`);
      fs.copyFileSync(file.filePath, versionPath);

      await this.prisma.fileVersion.create({
        data: {
          fileId,
          version: newVersion,
          filename: file.filename,
          fileSize: file.fileSize,
          mimeType: file.mimeType,
          filePath: versionPath,
          description: file.description,
          createdBy: updateData.updatedBy || 1,
          comment: updateData.comment,
        },
      });

      // Update file with new content
      const newFilePath = path.join(process.cwd(), 'uploads', updateData.newFile.filename);
      fs.renameSync(updateData.newFile.path, newFilePath);

      await this.prisma.file.update({
        where: { id: fileId },
        data: {
          filename: updateData.newFile.filename,
          originalFilename: updateData.newFile.originalname,
          fileSize: updateData.newFile.size,
          mimeType: updateData.newFile.mimetype,
          filePath: newFilePath,
          description: updateData.description || file.description,
        },
      });
    } else {
      // Just update metadata
      await this.prisma.file.update({
        where: { id: fileId },
        data: {
          description: updateData.description || file.description,
        },
      });
    }

    // Audit log
    await this.prisma.fileAuditLog.create({
      data: {
        fileId,
        action: 'UPDATED',
        userId: updateData.updatedBy || 1,
        details: updateData.comment || 'File updated',
      },
    });

    return this.getFileById(id);
  }

  async deleteFile(id: string) {
    const fileId = parseInt(id);
    const file = await this.prisma.file.findUnique({ where: { id: fileId } });
    if (!file) throw new Error('File not found');

    // Delete from disk
    if (fs.existsSync(file.filePath)) {
      fs.unlinkSync(file.filePath);
    }

    // Delete versions from disk
    const versions = await this.prisma.fileVersion.findMany({ where: { fileId } });
    for (const version of versions) {
      if (fs.existsSync(version.filePath)) {
        fs.unlinkSync(version.filePath);
      }
    }

    // Delete from database (cascade will handle associations, versions, audit logs)
    await this.prisma.file.delete({ where: { id: fileId } });

    return { message: 'File deleted' };
  }
}
