import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class VulnerabilitiesService {
  constructor(private prisma: PrismaService) {}

  async findBySystem(systemId: number) {
    return this.prisma.stigFinding.findMany({
      where: { systemId },
      include: {
        system: {
          select: {
            id: true,
            name: true,
          },
        },
        scan: {
          select: {
            id: true,
            title: true,
            checklistId: true,
          },
        },
      },
      orderBy: [{ severity: 'desc' }, { lastSeen: 'desc' }],
    });
  }

  async findByGroup(groupId: number) {
    return this.prisma.stigFinding.findMany({
      where: {
        system: {
          groupId,
        },
      },
      include: {
        system: {
          select: {
            id: true,
            name: true,
            group: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        scan: {
          select: {
            id: true,
            title: true,
            checklistId: true,
          },
        },
      },
      orderBy: [{ severity: 'desc' }, { lastSeen: 'desc' }],
    });
  }

  async findAll(filters?: {
    severity?: string;
    status?: string;
    systemId?: number;
    groupId?: number;
  }) {
    const where: Prisma.StigFindingWhereInput = {};

    if (filters?.severity) {
      where.severity = filters.severity;
    }
    if (filters?.status) {
      where.status = filters.status;
    }
    if (filters?.systemId) {
      where.systemId = filters.systemId;
    }
    if (filters?.groupId) {
      where.system = {
        groupId: filters.groupId,
      };
    }

    return this.prisma.stigFinding.findMany({
      where,
      include: {
        system: {
          select: {
            id: true,
            name: true,
            group: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        scan: {
          select: {
            id: true,
            title: true,
            checklistId: true,
          },
        },
      },
      orderBy: [{ severity: 'desc' }, { lastSeen: 'desc' }],
    });
  }

  async findOne(id: number) {
    return this.prisma.stigFinding.findUnique({
      where: { id },
      include: {
        system: {
          select: {
            id: true,
            name: true,
            group: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        scan: {
          select: {
            id: true,
            title: true,
            checklistId: true,
            createdAt: true,
          },
        },
      },
    });
  }

  async update(id: number, data: Prisma.StigFindingUpdateInput) {
    return this.prisma.stigFinding.update({
      where: { id },
      data: {
        ...data,
        lastSeen: new Date(),
      },
      include: {
        system: {
          select: {
            id: true,
            name: true,
          },
        },
        scan: {
          select: {
            id: true,
            title: true,
            checklistId: true,
          },
        },
      },
    });
  }

  // STIG Scans
  async findScans(systemId?: number) {
    const where: Prisma.StigScanWhereInput = {};
    if (systemId) {
      where.systemId = systemId;
    }

    return this.prisma.stigScan.findMany({
      where,
      include: {
        system: {
          select: {
            id: true,
            name: true,
          },
        },
        stigFindings: {
          select: {
            id: true,
            severity: true,
            status: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async createScan(
    systemId: number,
    data: { title?: string; checklistId?: string },
  ) {
    return this.prisma.stigScan.create({
      data: {
        systemId,
        title: data.title,
        checklistId: data.checklistId,
      },
      include: {
        system: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async getScanWithFindings(scanId: number) {
    return this.prisma.stigScan.findUnique({
      where: { id: scanId },
      include: {
        system: {
          select: {
            id: true,
            name: true,
          },
        },
        stigFindings: {
          orderBy: [{ severity: 'desc' }, { ruleId: 'asc' }],
        },
      },
    });
  }

  // Bulk create findings from STIG scan
  async createFindings(scanId: number, systemId: number, findings: any[]) {
    const findingsData = findings.map((finding) => ({
      systemId,
      scanId,
      groupId: finding.groupId || finding.group_id,
      ruleId: finding.ruleId || finding.rule_id,
      ruleVersion: finding.ruleVersion || finding.rule_version,
      ruleTitle: finding.ruleTitle || finding.rule_title,
      severity: finding.severity,
      status: finding.status,
      findingDetails: finding.findingDetails || finding.finding_details,
      checkContent: finding.checkContent || finding.check_content,
      fixText: finding.fixText || finding.fix_text,
      cci: finding.cci,
    }));

    // Use createMany for bulk insert
    await this.prisma.stigFinding.createMany({
      data: findingsData,
    });

    // Return the scan with updated findings count
    return this.getScanWithFindings(scanId);
  }

  // Get vulnerability metrics for a group
  async getGroupVulnerabilityMetrics(groupId: number) {
    // Get all systems in the group
    const systems = await this.prisma.system.findMany({
      where: { groupId },
      include: {
        _count: {
          select: {
            stigFindings: true,
            stigScans: true,
          },
        },
      },
    });

    // Get all findings for systems in this group
    const findings = await this.prisma.stigFinding.findMany({
      where: {
        system: {
          groupId,
        },
      },
      select: {
        severity: true,
        status: true,
        lastSeen: true,
      },
      orderBy: {
        lastSeen: 'desc',
      },
    });

    // Get the most recent scan date
    const latestScan = await this.prisma.stigScan.findFirst({
      where: {
        system: {
          groupId,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        createdAt: true,
      },
    });

    // Calculate metrics
    const totalFindings = findings.length;
    const openFindings = findings.filter((f) => f.status === 'Open').length;
    const closedFindings = findings.filter(
      (f) => f.status === 'NotAFinding',
    ).length;
    const notApplicableFindings = findings.filter(
      (f) => f.status === 'Not_Applicable',
    ).length;

    const highSeverity = findings.filter((f) => f.severity === 'high').length;
    const mediumSeverity = findings.filter(
      (f) => f.severity === 'medium',
    ).length;
    const lowSeverity = findings.filter((f) => f.severity === 'low').length;

    const systemsWithFindings = systems.filter(
      (s) => s._count.stigFindings > 0,
    ).length;

    const complianceRate =
      totalFindings > 0
        ? Math.round(
            ((closedFindings + notApplicableFindings) / totalFindings) * 100,
          )
        : 0;

    return {
      totalFindings,
      openFindings,
      closedFindings,
      highSeverity,
      mediumSeverity,
      lowSeverity,
      complianceRate,
      systemsWithFindings,
      totalSystems: systems.length,
      lastScanDate: latestScan?.createdAt || null,
      systems: systems.map((system) => ({
        id: system.id,
        name: system.name,
        findingsCount: system._count.stigFindings,
        scansCount: system._count.stigScans,
      })),
    };
  }
}
