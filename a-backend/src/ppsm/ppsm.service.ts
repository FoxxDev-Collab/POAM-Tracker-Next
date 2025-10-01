import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PpsmService {
  constructor(private prisma: PrismaService) {}

  async getPackagePPSM(packageId: number) {
    const entries = await this.prisma.systemPPSM.findMany({
      where: {
        system: {
          packageId,
        },
      },
      include: {
        system: {
          select: {
            id: true,
            name: true,
            ipAddress: true,
          },
        },
      },
      orderBy: {
        port: 'asc',
      },
    });

    return {
      entries: entries.map(entry => ({
        id: entry.id,
        systemId: entry.systemId,
        systemName: entry.system.name,
        port: entry.port,
        protocol: entry.protocol,
        service: entry.service,
        direction: entry.direction,
        source: entry.sourceIP || '',
        destination: entry.destinationIP || '',
        justification: entry.justification,
        approvalStatus: entry.approvalStatus,
        riskLevel: this.calculateRiskLevel(parseInt(entry.port), entry.protocol),
        notes: entry.riskAssessment || '',
        createdAt: entry.createdAt,
        updatedAt: entry.updatedAt,
      })),
    };
  }

  async getSystemPPSM(systemId: number) {
    const entries = await this.prisma.systemPPSM.findMany({
      where: { systemId },
      orderBy: { port: 'asc' },
    });

    return {
      entries: entries.map(entry => ({
        id: entry.id,
        systemId: entry.systemId,
        port: parseInt(entry.port),
        protocol: entry.protocol,
        service: entry.service,
        direction: entry.direction,
        sourceIP: entry.sourceIP || '',
        destinationIP: entry.destinationIP || '',
        justification: entry.justification,
        approvalStatus: entry.approvalStatus,
        riskLevel: this.calculateRiskLevel(parseInt(entry.port), entry.protocol),
        notes: entry.riskAssessment || '',
        createdAt: entry.createdAt,
        updatedAt: entry.updatedAt,
      })),
    };
  }

  async getPPSMById(id: number) {
    return this.prisma.systemPPSM.findUnique({
      where: { id },
      include: {
        system: true,
      },
    });
  }

  async createPPSM(data: {
    systemId: number;
    port: number;
    protocol: string;
    service: string;
    direction: string;
    source: string;
    destination: string;
    justification?: string;
    notes?: string;
    packageId?: number;
  }) {
    // If packageId is provided but no systemId, create a virtual system
    let systemId = data.systemId;

    if (!systemId && data.packageId) {
      // Find or create a default system for PPSM entries
      const defaultSystem = await this.prisma.system.findFirst({
        where: {
          packageId: data.packageId,
          name: 'PPSM Default System',
        },
      });

      if (defaultSystem) {
        systemId = defaultSystem.id;
      } else {
        const newSystem = await this.prisma.system.create({
          data: {
            name: 'PPSM Default System',
            packageId: data.packageId,
            operatingSystem: null,
            ipAddress: '0.0.0.0',
            description: 'Default system for PPSM entries',
            isVirtual: true,
          },
        });
        systemId = newSystem.id;
      }
    }

    return this.prisma.systemPPSM.create({
      data: {
        systemId,
        port: data.port.toString(),
        protocol: data.protocol,
        service: data.service,
        direction: (data.direction || 'Inbound') as any,
        sourceIP: data.source || null,
        destinationIP: data.destination || null,
        justification: data.justification || 'Required for system operation',
        approvalStatus: 'Pending' as any,
        riskAssessment: this.calculateRiskLevel(data.port, data.protocol) + ' risk',
        createdBy: 1, // TODO: Get from context
      },
    });
  }

  async updatePPSM(id: number, data: any) {
    const updateData: any = {};

    if (data.port !== undefined) updateData.port = data.port.toString();
    if (data.protocol !== undefined) updateData.protocol = data.protocol;
    if (data.service !== undefined) updateData.service = data.service;
    if (data.direction !== undefined) updateData.direction = data.direction;
    if (data.source !== undefined) updateData.sourceIP = data.source;
    if (data.destination !== undefined) updateData.destinationIP = data.destination;
    if (data.justification !== undefined) updateData.justification = data.justification;
    if (data.notes !== undefined) updateData.riskAssessment = data.notes;

    // Recalculate risk level if port or protocol changed
    if (data.port !== undefined || data.protocol !== undefined) {
      const existing = await this.prisma.systemPPSM.findUnique({
        where: { id },
      });
      if (existing) {
        const port = data.port || parseInt(existing.port);
        const protocol = data.protocol || existing.protocol;
        updateData.riskAssessment = this.calculateRiskLevel(port, protocol) + ' risk';
      }
    }

    return this.prisma.systemPPSM.update({
      where: { id },
      data: updateData,
    });
  }

  async deletePPSM(id: number) {
    return this.prisma.systemPPSM.delete({
      where: { id },
    });
  }

  async approvePPSM(id: number, approverId?: number) {
    return this.prisma.systemPPSM.update({
      where: { id },
      data: {
        approvalStatus: 'Approved',
        approvedBy: approverId,
        approvedAt: new Date(),
      },
    });
  }

  async rejectPPSM(id: number, reason?: string) {
    return this.prisma.systemPPSM.update({
      where: { id },
      data: {
        approvalStatus: 'Rejected',
        riskAssessment: `Rejected: ${reason || 'Does not meet security requirements'}`,
      },
    });
  }

  private calculateRiskLevel(port: number, protocol: string): string {
    // High-risk ports
    const highRiskPorts = [21, 23, 135, 139, 445, 1433, 3389];
    // Medium-risk ports
    const mediumRiskPorts = [22, 80, 443, 3306, 5432, 8080, 8443];

    if (highRiskPorts.includes(port)) {
      return 'High';
    } else if (mediumRiskPorts.includes(port)) {
      return 'Medium';
    } else if (port < 1024) {
      // Well-known ports
      return 'Medium';
    } else {
      return 'Low';
    }
  }
}