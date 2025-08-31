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

  async create(createPackageDto: CreatePackageDto): Promise<Package> {
    return this.prisma.package.create({
      data: createPackageDto,
    });
  }

  async findAll(): Promise<Package[]> {
    return this.prisma.package.findMany({
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

  async update(id: number, updatePackageDto: UpdatePackageDto): Promise<Package> {
    return this.prisma.package.update({
      where: { id },
      data: updatePackageDto,
    });
  }

  async remove(id: number): Promise<Package> {
    return this.prisma.package.delete({
      where: { id },
    });
  }
}
