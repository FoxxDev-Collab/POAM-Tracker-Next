import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DocumentType } from '@prisma/client';

@Injectable()
export class DocumentsService {
  constructor(private readonly prisma: PrismaService) {}

  async getCategories() {
    // First check if categories exist, if not create them
    const existingCategories = await this.prisma.documentCategory.findMany({
      orderBy: { displayOrder: 'asc' },
    });

    if (existingCategories.length === 0) {
      // Create default categories
      const categories = [
        { controlFamily: 'AC', name: 'Access Control', displayOrder: 1 },
        { controlFamily: 'AT', name: 'Awareness and Training', displayOrder: 2 },
        { controlFamily: 'AU', name: 'Audit and Accountability', displayOrder: 3 },
        { controlFamily: 'CA', name: 'Assessment, Authorization, and Monitoring', displayOrder: 4 },
        { controlFamily: 'CM', name: 'Configuration Management', displayOrder: 5 },
        { controlFamily: 'CP', name: 'Contingency Planning', displayOrder: 6 },
        { controlFamily: 'IA', name: 'Identification and Authentication', displayOrder: 7 },
        { controlFamily: 'IR', name: 'Incident Response', displayOrder: 8 },
        { controlFamily: 'MA', name: 'Maintenance', displayOrder: 9 },
        { controlFamily: 'MP', name: 'Media Protection', displayOrder: 10 },
        { controlFamily: 'PE', name: 'Physical and Environmental Protection', displayOrder: 11 },
        { controlFamily: 'PL', name: 'Planning', displayOrder: 12 },
        { controlFamily: 'PM', name: 'Program Management', displayOrder: 13 },
        { controlFamily: 'PS', name: 'Personnel Security', displayOrder: 14 },
        { controlFamily: 'PT', name: 'PII Processing and Transparency', displayOrder: 15 },
        { controlFamily: 'RA', name: 'Risk Assessment', displayOrder: 16 },
        { controlFamily: 'SA', name: 'System and Services Acquisition', displayOrder: 17 },
        { controlFamily: 'SC', name: 'System and Communications Protection', displayOrder: 18 },
        { controlFamily: 'SI', name: 'System and Information Integrity', displayOrder: 19 },
        { controlFamily: 'SR', name: 'Supply Chain Risk Management', displayOrder: 20 },
      ];

      await this.prisma.documentCategory.createMany({
        data: categories,
      });

      return this.prisma.documentCategory.findMany({
        orderBy: { displayOrder: 'asc' },
      });
    }

    return existingCategories;
  }

  async getPackageDocuments(
    packageId: number,
    controlFamily?: string,
    documentType?: string,
  ) {
    try {
      const where: any = { packageId, isActive: true };

      if (controlFamily) {
        const category = await this.prisma.documentCategory.findUnique({
          where: { controlFamily },
        });
        if (category) {
          where.categoryId = category.id;
        }
      }

      if (documentType) {
        where.documentType = documentType as DocumentType;
      }

      const documents = await this.prisma.controlDocument.findMany({
        where,
        include: {
          category: true,
          currentVersion: {
            include: {
              uploader: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
          },
          versions: {
            orderBy: { versionNumber: 'desc' },
            take: 1,
          },
        },
        orderBy: { updatedAt: 'desc' },
      });

      return { documents };
    } catch (error) {
      console.error('Error getting package documents:', error);
      return { documents: [] };
    }
  }

  async getPackageDocumentStats(packageId: number) {
    try {
      const documents = await this.prisma.controlDocument.findMany({
        where: { packageId, isActive: true },
        include: {
          currentVersion: true,
        },
      });

      const stats = {
        totalDocuments: documents.length,
        policies: documents.filter(d => d.documentType === 'Policy').length,
        procedures: documents.filter(d => d.documentType === 'Procedure').length,
        plans: documents.filter(d => d.documentType === 'Plan').length,
        pendingApproval: documents.filter(
          d => d.currentVersion?.approvalStatus === 'Pending'
        ).length,
        recentUploads: documents.filter(d => {
          const uploadDate = new Date(d.createdAt);
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          return uploadDate > thirtyDaysAgo;
        }).length,
      };

      return stats;
    } catch (error) {
      console.error('Error getting document stats:', error);
      // Return default stats if error
      return {
        totalDocuments: 0,
        policies: 0,
        procedures: 0,
        plans: 0,
        pendingApproval: 0,
        recentUploads: 0,
      };
    }
  }

  async getRecentDocuments(packageId: number, limit: number = 10) {
    try {
      const documents = await this.prisma.controlDocument.findMany({
        where: { packageId, isActive: true },
        include: {
          category: true,
          currentVersion: {
            include: {
              uploader: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
        take: limit,
      });

      return { documents };
    } catch (error) {
      console.error('Error getting recent documents:', error);
      return { documents: [] };
    }
  }

  async getDocumentVersions(documentId: number) {
    return this.prisma.documentVersion.findMany({
      where: { documentId },
      include: {
        uploader: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        approver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { versionNumber: 'desc' },
    });
  }

  async getDocumentVersion(versionId: number) {
    return this.prisma.documentVersion.findUnique({
      where: { id: versionId },
      include: {
        document: {
          include: {
            category: true,
          },
        },
        uploader: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  async uploadDocument(data: {
    packageId: number;
    controlFamily: string;
    documentType: string;
    documentSubType?: string;
    title: string;
    description?: string;
    changeNotes?: string;
    existingDocumentId?: number;
    file: {
      filename: string;
      originalName: string;
      mimeType: string;
      size: number;
      path: string;
      checksum: string;
    };
    uploadedBy: number;
  }) {
    // Get or create category
    let category = await this.prisma.documentCategory.findUnique({
      where: { controlFamily: data.controlFamily },
    });

    if (!category) {
      // Ensure categories are created
      await this.getCategories();

      // Try again
      category = await this.prisma.documentCategory.findUnique({
        where: { controlFamily: data.controlFamily },
      });

      if (!category) {
        throw new BadRequestException('Invalid control family');
      }
    }

    // Check if this is a new document or new version
    if (data.existingDocumentId) {
      // New version of existing document
      const existingDoc = await this.prisma.controlDocument.findUnique({
        where: { id: data.existingDocumentId },
        include: {
          versions: {
            orderBy: { versionNumber: 'desc' },
            take: 1,
          },
        },
      });

      if (!existingDoc) {
        throw new NotFoundException('Document not found');
      }

      const nextVersion = (existingDoc.versions[0]?.versionNumber || 0) + 1;

      // Create new version
      const newVersion = await this.prisma.documentVersion.create({
        data: {
          documentId: existingDoc.id,
          versionNumber: nextVersion,
          fileName: data.file.originalName,
          filePath: data.file.path,
          fileSize: data.file.size,
          mimeType: data.file.mimeType,
          checksum: data.file.checksum,
          uploadedBy: data.uploadedBy,
          changeNotes: data.changeNotes,
          approvalStatus: 'Pending',
        },
      });

      // Update document's current version
      await this.prisma.controlDocument.update({
        where: { id: existingDoc.id },
        data: {
          currentVersionId: newVersion.id,
          updatedAt: new Date(),
        },
      });

      return newVersion;
    } else {
      // New document
      const newDocument = await this.prisma.controlDocument.create({
        data: {
          packageId: data.packageId,
          categoryId: category.id,
          documentType: data.documentType as DocumentType,
          documentSubType: data.documentSubType,
          title: data.title,
          description: data.description,
        },
      });

      // Create first version
      const firstVersion = await this.prisma.documentVersion.create({
        data: {
          documentId: newDocument.id,
          versionNumber: 1,
          fileName: data.file.originalName,
          filePath: data.file.path,
          fileSize: data.file.size,
          mimeType: data.file.mimeType,
          checksum: data.file.checksum,
          uploadedBy: data.uploadedBy,
          changeNotes: 'Initial version',
          approvalStatus: 'Pending',
        },
      });

      // Update document with current version
      await this.prisma.controlDocument.update({
        where: { id: newDocument.id },
        data: { currentVersionId: firstVersion.id },
      });

      return {
        document: newDocument,
        version: firstVersion,
      };
    }
  }

  async approveDocument(
    documentId: number,
    versionId: number,
    approvedBy: number,
    notes?: string,
  ) {
    const version = await this.prisma.documentVersion.update({
      where: { id: versionId },
      data: {
        approvalStatus: 'Approved',
        approvedBy,
        approvedAt: new Date(),
        changeNotes: notes ? `${notes} | Approved` : 'Approved',
      },
    });

    // Update document's current version if this is the latest
    await this.prisma.controlDocument.update({
      where: { id: documentId },
      data: {
        currentVersionId: versionId,
        updatedAt: new Date(),
      },
    });

    return version;
  }

  async rejectDocument(
    documentId: number,
    versionId: number,
    rejectedBy: number,
    reason: string,
  ) {
    return this.prisma.documentVersion.update({
      where: { id: versionId },
      data: {
        approvalStatus: 'Rejected',
        approvedBy: rejectedBy,
        approvedAt: new Date(),
        changeNotes: `Rejected: ${reason}`,
      },
    });
  }

  async deleteDocument(documentId: number) {
    // Soft delete
    return this.prisma.controlDocument.update({
      where: { id: documentId },
      data: { isActive: false },
    });
  }
}