import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { Package, PackageDocument } from '@prisma/client';
import { CreatePackageDto, UpdatePackageDto } from './dto';
import type { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class PackagesService {
  constructor(private prisma: PrismaService) {}

  async create(createPackageDto: CreatePackageDto): Promise<{ item: Package }> {
    // Normalize enum fields before creating
    const normalizedData = this.normalizeEnumFields(createPackageDto);
    // Whitelist and map only valid fields for the Package model
    const sanitized = this.sanitizeAndMapPackageData(normalizedData);

    const packageItem = await this.prisma.package.create({
      data: sanitized,
    });

    return { item: packageItem };
  }

  async findAll(): Promise<{ items: Package[] }> {
    const packages = await this.prisma.package.findMany({
      include: {
        team: true,
        groups: true,
        systems: true,
        _count: {
          select: {
            groups: true,
            systems: true,
            stps: true,
            poams: true,
          },
        },
      },
    });

    return { items: packages };
  }

  async findOne(id: number): Promise<Package | null> {
    return this.prisma.package.findUnique({
      where: { id },
      include: {
        team: true,
        groups: true,
        systems: true,
        stps: true,
        poams: true,
      },
    });
  }

  async update(
    id: number,
    updatePackageDto: UpdatePackageDto,
  ): Promise<{ item: Package }> {
    // Filter out read-only and relation fields that shouldn't be updated
    /* eslint-disable @typescript-eslint/no-unused-vars */
    const {
      // Remove read-only fields
      id: _id,
      createdAt,
      updatedAt,
      // Remove relation fields
      team,
      groups,
      systems,
      stps,
      poams,
      // Keep only updateable fields
      ...validUpdateData
    } = updatePackageDto as UpdatePackageDto & Record<string, unknown>;
    /* eslint-enable @typescript-eslint/no-unused-vars */

    // Convert enum string values to match Prisma schema format
    const normalizedData = this.normalizeEnumFields(validUpdateData);
    const sanitized = this.sanitizeAndMapPackageData(normalizedData);

    const packageItem = await this.prisma.package.update({
      where: { id },
      data: sanitized,
      include: {
        team: true,
        groups: true,
        systems: true,
        stps: true,
        poams: true,
      },
    });

    return { item: packageItem };
  }

  private normalizeEnumFields(data: any): Record<string, unknown> {
    const normalized = { ...data };

    // Convert ImpactLevel enums (LOW/MODERATE/HIGH -> Low/Moderate/High)
    const impactFields = [
      'confidentialityImpact',
      'integrityImpact',
      'availabilityImpact',
      'overallCategorization',
    ];
    impactFields.forEach((field) => {
      if (normalized[field] && typeof normalized[field] === 'string') {
        normalized[field] = this.normalizeImpactLevel(normalized[field] as string);
      }
    });

    // Convert AuthorizationStatus enum
    if (normalized.authorizationStatus && typeof normalized.authorizationStatus === 'string') {
      normalized.authorizationStatus = this.normalizeAuthorizationStatus(
        normalized.authorizationStatus as string,
      );
    }

    // Convert other enum fields as needed
    if (normalized.systemType && typeof normalized.systemType === 'string') {
      normalized.systemType = this.normalizeSystemType(normalized.systemType as string);
    }

    if (normalized.residualRiskLevel && typeof normalized.residualRiskLevel === 'string') {
      normalized.residualRiskLevel = this.normalizeResidualRiskLevel(
        normalized.residualRiskLevel as string,
      );
    }

    if (normalized.dataClassification && typeof normalized.dataClassification === 'string') {
      normalized.dataClassification = this.normalizeDataClassification(
        normalized.dataClassification as string,
      );
    }

    if (normalized.rmfStep && typeof normalized.rmfStep === 'string') {
      normalized.rmfStep = this.normalizeRmfStep(normalized.rmfStep as string);
    }

    return normalized;
  }

  // Ensure only fields defined on the Prisma Package model are sent to Prisma,
  // and map common alias fields from the request payload to schema fields.
  private sanitizeAndMapPackageData(data: Record<string, unknown>): any {
    const allowedKeys = new Set([
      'name',
      'description',
      'teamId',
      // RMF progress
      'rmfStep',
      'categorizeComplete',
      'selectComplete',
      'implementComplete',
      'assessComplete',
      'authorizeComplete',
      'monitorComplete',
      // Assignments
      'systemOwner',
      'authorizingOfficial',
      'issoName',
      'issmName',
      'systemAdministrator',
      'networkAdministrator',
      'databaseAdministrator',
      'applicationAdministrator',
      'securityControlAssessor',
      // Categorization
      'systemType',
      'confidentialityImpact',
      'integrityImpact',
      'availabilityImpact',
      'overallCategorization',
      'missionCriticality',
      'dataClassification',
      // Control selection
      'securityControlBaseline',
      'controlSelectionRationale',
      'tailoringDecisions',
      // Authorization
      'authorizationStatus',
      'authorizationDate',
      'authorizationExpiry',
      'riskAssessmentDate',
      'residualRiskLevel',
      // Monitoring
      'poamStatus',
      'continuousMonitoringStatus',
      'lastAssessmentDate',
      'nextAssessmentDate',
      // Business info
      'businessOwner',
      'businessPurpose',
      'organizationalUnit',
      'physicalLocation',
      // Onboarding
      'onboardingComplete',
      'onboardingCompletedAt',
      'onboardingCompletedBy',
      // Relations (optional nested creates – leave here for future use)
      'team',
      'groups',
      'systems',
      'stps',
      'poams',
      'nessusReports',
    ]);

    const mapped: Record<string, unknown> = { ...data };

    // Map aliases from incoming payload to schema fields
    if (mapped.authorizedOfficialName && !mapped.authorizingOfficial) {
      mapped.authorizingOfficial = mapped.authorizedOfficialName;
    }
    if (mapped.systemOwnerName && !mapped.systemOwner) {
      mapped.systemOwner = mapped.systemOwnerName;
    }
    if (mapped.isssoName && !mapped.issoName) {
      mapped.issoName = mapped.isssoName;
    }
    // Map generic impactLevel -> overallCategorization if provided
    if (mapped.impactLevel && !mapped.overallCategorization && typeof mapped.impactLevel === 'string') {
      mapped.overallCategorization = this.normalizeImpactLevel(
        mapped.impactLevel as string,
      );
    }

    // Drop fields not recognized by the Package model
    const sanitized: Record<string, unknown> = {};
    for (const key of Object.keys(mapped)) {
      if (allowedKeys.has(key)) {
        sanitized[key] = mapped[key];
      }
    }

    return sanitized;
  }

  private normalizeImpactLevel(value: string): string {
    switch (value?.toUpperCase()) {
      case 'LOW':
        return 'Low';
      case 'MODERATE':
        return 'Moderate';
      case 'HIGH':
        return 'High';
      default:
        return value;
    }
  }

  private normalizeAuthorizationStatus(value: string): string {
    switch (value) {
      case 'NOT_STARTED':
        return 'Not_Started';
      case 'IN_PROGRESS':
        return 'In_Progress';
      case 'AUTHORIZED':
        return 'Authorized';
      case 'REAUTHORIZATION_REQUIRED':
        return 'Reauthorization_Required';
      default:
        return value;
    }
  }

  private normalizeSystemType(value: string): string {
    switch (value) {
      case 'MAJOR_APPLICATION':
        return 'Major_Application';
      case 'GENERAL_SUPPORT_SYSTEM':
        return 'General_Support_System';
      case 'MINOR_APPLICATION':
        return 'Minor_Application';
      case 'SUBSYSTEM':
        return 'Subsystem';
      default:
        return value;
    }
  }

  private normalizeResidualRiskLevel(value: string): string {
    switch (value?.toUpperCase()) {
      case 'VERY_LOW':
        return 'Very_Low';
      case 'LOW':
        return 'Low';
      case 'MODERATE':
        return 'Moderate';
      case 'HIGH':
        return 'High';
      case 'VERY_HIGH':
        return 'Very_High';
      default:
        return value;
    }
  }

  private normalizeDataClassification(value: string): string {
    switch (value) {
      case 'UNCLASSIFIED':
        return 'Unclassified';
      case 'CUI':
        return 'CUI';
      case 'CONFIDENTIAL':
        return 'Confidential';
      case 'SECRET':
        return 'Secret';
      case 'TOP_SECRET':
        return 'Top_Secret';
      case 'TS_SCI':
        return 'TS_SCI';
      default:
        return value;
    }
  }

  private normalizeRmfStep(value: string): string {
    switch (value) {
      case 'CATEGORIZE':
        return 'Categorize';
      case 'SELECT':
        return 'Select';
      case 'IMPLEMENT':
        return 'Implement';
      case 'ASSESS':
        return 'Assess';
      case 'AUTHORIZE':
        return 'Authorize';
      case 'MONITOR':
        return 'Monitor';
      default:
        return value;
    }
  }

  async remove(id: number): Promise<Package> {
    return this.prisma.package.delete({
      where: { id },
    });
  }

  // Package Documents Methods
  async getDocuments(packageId: number): Promise<PackageDocument[]> {
    return this.prisma.packageDocument.findMany({
      where: {
        packageId,
        isActive: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async uploadDocument(packageId: number, file: Express.Multer.File, body: any): Promise<PackageDocument> {
    // Ensure package exists
    const packageExists = await this.prisma.package.findUnique({
      where: { id: packageId }
    });

    if (!packageExists) {
      throw new Error('Package not found');
    }

    // Create uploads directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'uploads', 'packages', packageId.toString());
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Generate unique filename
    const fileExtension = path.extname(file.originalname);
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}${fileExtension}`;
    const filePath = path.join(uploadDir, fileName);

    // Save file to disk - handle both buffer and path scenarios
    if (file.buffer) {
      fs.writeFileSync(filePath, file.buffer);
    } else if (file.path) {
      // If multer saved to temp path, move it
      fs.copyFileSync(file.path, filePath);
      fs.unlinkSync(file.path);
    } else {
      throw new Error('No file data available');
    }

    // Save document record to database
    const document = await this.prisma.packageDocument.create({
      data: {
        packageId,
        filename: fileName,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        documentType: body.documentType || 'OTHER',
        rmfStep: body.rmfStep || 'Categorize',
        uploadedBy: body.uploadedBy || 'System', // TODO: get from auth context
        description: body.description || '',
        path: filePath,
      }
    });

    return document;
  }

  async downloadDocument(packageId: number, documentId: string, res: Response): Promise<void> {
    const document = await this.prisma.packageDocument.findFirst({
      where: {
        id: documentId,
        packageId,
        isActive: true
      }
    });

    if (!document) {
      res.status(404).json({ error: 'Document not found' });
      return;
    }

    if (!fs.existsSync(document.path)) {
      res.status(404).json({ error: 'File not found on disk' });
      return;
    }

    res.setHeader('Content-Disposition', `attachment; filename="${document.originalName}"`);
    res.setHeader('Content-Type', document.mimeType || 'application/octet-stream');

    const fileStream = fs.createReadStream(document.path);
    fileStream.pipe(res);
  }

  async deleteDocument(packageId: number, documentId: string): Promise<{ message: string }> {
    const document = await this.prisma.packageDocument.findFirst({
      where: {
        id: documentId,
        packageId,
        isActive: true
      }
    });

    if (!document) {
      throw new Error('Document not found');
    }

    // Delete file from disk
    if (fs.existsSync(document.path)) {
      fs.unlinkSync(document.path);
    }

    // Mark document as inactive (soft delete)
    await this.prisma.packageDocument.update({
      where: { id: documentId },
      data: { isActive: false }
    });

    return { message: 'Document deleted successfully' };
  }
}
