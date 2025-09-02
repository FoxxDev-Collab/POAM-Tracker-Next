import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { Package, SystemType, ImpactLevel, AuthorizationStatus, ResidualRiskLevel, MissionCriticality, DataClassification, SecurityControlBaseline, PoamStatus, ContinuousMonitoringStatus } from '@prisma/client';

export interface CreatePackageDto {
  name: string;
  description?: string;
  teamId?: number;
  systemType?: SystemType;
  confidentialityImpact?: ImpactLevel;
  integrityImpact?: ImpactLevel;
  availabilityImpact?: ImpactLevel;
  overallCategorization?: ImpactLevel;
  authorizationStatus?: AuthorizationStatus;
  authorizationDate?: string;
  authorizationExpiry?: string;
  riskAssessmentDate?: string;
  residualRiskLevel?: ResidualRiskLevel;
  missionCriticality?: MissionCriticality;
  dataClassification?: DataClassification;
  systemOwner?: string;
  authorizingOfficial?: string;
  issoName?: string;
  securityControlBaseline?: SecurityControlBaseline;
  poamStatus?: PoamStatus;
  continuousMonitoringStatus?: ContinuousMonitoringStatus;
}

export interface UpdatePackageDto {
  name?: string;
  description?: string;
  teamId?: number;
  systemType?: SystemType;
  confidentialityImpact?: ImpactLevel;
  integrityImpact?: ImpactLevel;
  availabilityImpact?: ImpactLevel;
  overallCategorization?: ImpactLevel;
  authorizationStatus?: AuthorizationStatus;
  authorizationDate?: string;
  authorizationExpiry?: string;
  riskAssessmentDate?: string;
  residualRiskLevel?: ResidualRiskLevel;
  missionCriticality?: MissionCriticality;
  dataClassification?: DataClassification;
  systemOwner?: string;
  authorizingOfficial?: string;
  issoName?: string;
  securityControlBaseline?: SecurityControlBaseline;
  poamStatus?: PoamStatus;
  continuousMonitoringStatus?: ContinuousMonitoringStatus;
}

@Injectable()
export class PackagesService {
  constructor(private prisma: PrismaService) {}

  async create(createPackageDto: CreatePackageDto): Promise<{ item: Package }> {
    const packageItem = await this.prisma.package.create({
      data: createPackageDto,
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

  async update(id: number, updatePackageDto: UpdatePackageDto): Promise<{ item: Package }> {
    // Filter out read-only and relation fields that shouldn't be updated
    const { 
      // Remove read-only fields
      id: _id, 
      createdAt: _createdAt, 
      updatedAt: _updatedAt,
      // Remove relation fields 
      team: _team,
      groups: _groups,
      systems: _systems,
      stps: _stps,
      poams: _poams,
      // Keep only updateable fields
      ...validUpdateData 
    } = updatePackageDto as any;

    // Convert enum string values to match Prisma schema format
    const normalizedData = this.normalizeEnumFields(validUpdateData);

    const packageItem = await this.prisma.package.update({
      where: { id },
      data: normalizedData,
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

  private normalizeEnumFields(data: any): any {
    const normalized = { ...data };
    
    // Convert ImpactLevel enums (LOW/MODERATE/HIGH -> Low/Moderate/High)
    const impactFields = ['confidentialityImpact', 'integrityImpact', 'availabilityImpact', 'overallCategorization'];
    impactFields.forEach(field => {
      if (normalized[field]) {
        normalized[field] = this.normalizeImpactLevel(normalized[field]);
      }
    });

    // Convert AuthorizationStatus enum
    if (normalized.authorizationStatus) {
      normalized.authorizationStatus = this.normalizeAuthorizationStatus(normalized.authorizationStatus);
    }

    // Convert other enum fields as needed
    if (normalized.systemType) {
      normalized.systemType = this.normalizeSystemType(normalized.systemType);
    }
    
    if (normalized.residualRiskLevel) {
      normalized.residualRiskLevel = this.normalizeResidualRiskLevel(normalized.residualRiskLevel);
    }

    return normalized;
  }

  private normalizeImpactLevel(value: string): string {
    switch (value?.toUpperCase()) {
      case 'LOW': return 'Low';
      case 'MODERATE': return 'Moderate';
      case 'HIGH': return 'High';
      default: return value;
    }
  }

  private normalizeAuthorizationStatus(value: string): string {
    switch (value) {
      case 'NOT_STARTED': return 'Not_Started';
      case 'IN_PROGRESS': return 'In_Progress';
      case 'AUTHORIZED': return 'Authorized';
      case 'REAUTHORIZATION_REQUIRED': return 'Reauthorization_Required';
      default: return value;
    }
  }

  private normalizeSystemType(value: string): string {
    switch (value) {
      case 'MAJOR_APPLICATION': return 'Major_Application';
      case 'GENERAL_SUPPORT_SYSTEM': return 'General_Support_System';
      case 'MINOR_APPLICATION': return 'Minor_Application';
      case 'SUBSYSTEM': return 'Subsystem';
      default: return value;
    }
  }

  private normalizeResidualRiskLevel(value: string): string {
    switch (value?.toUpperCase()) {
      case 'VERY_LOW': return 'Very_Low';
      case 'LOW': return 'Low';
      case 'MODERATE': return 'Moderate';
      case 'HIGH': return 'High';
      case 'VERY_HIGH': return 'Very_High';
      default: return value;
    }
  }

  async remove(id: number): Promise<Package> {
    return this.prisma.package.delete({
      where: { id },
    });
  }
}
