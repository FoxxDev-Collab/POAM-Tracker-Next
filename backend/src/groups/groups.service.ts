import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Group } from '@prisma/client';
import { CreateGroupDto, UpdateGroupDto } from './dto';

@Injectable()
export class GroupsService {
  constructor(private prisma: PrismaService) {}

  async create(createGroupDto: CreateGroupDto): Promise<{ item: Group }> {
    const group = await this.prisma.group.create({
      data: createGroupDto,
    });

    return { item: group };
  }

  async findAll(): Promise<Group[]> {
    return this.prisma.group.findMany({
      include: {
        package: true,
        systems: true,
        _count: {
          select: {
            systems: true,
            poams: true,
          },
        },
      },
    });
  }

  async findByPackage(packageId: number): Promise<{ items: any[] }> {
    const groups = await this.prisma.group.findMany({
      where: { packageId },
      include: {
        systems: true,
        _count: {
          select: {
            systems: true,
            poams: true,
          },
        },
      },
    });

    // Enrich groups with vulnerability stats aggregated from all systems in the group
    const enrichedGroups = await Promise.all(
      groups.map(async (group) => {
        // Get vulnerability counts for all systems in this group
        const systemVulnCounts = await Promise.all(
          group.systems.map(async (system) => {
            const vulnerabilityCounts = await this.prisma.stigFinding.groupBy({
              by: ['severity'],
              where: {
                systemId: system.id,
              },
              _count: {
                severity: true,
              },
            });

            let total = 0;
            let high = 0;
            let medium = 0;
            let low = 0;

            vulnerabilityCounts.forEach((count) => {
              const severity = count.severity?.toLowerCase() || '';
              const countValue = count._count.severity;

              total += countValue;

              if (severity.includes('high') || severity.includes('cat') && severity.includes('i')) {
                high += countValue;
              } else if (severity.includes('medium') || severity.includes('cat') && severity.includes('ii')) {
                medium += countValue;
              } else if (severity.includes('low') || severity.includes('cat') && severity.includes('iii')) {
                low += countValue;
              }
            });

            return { total, high, medium, low };
          })
        );

        // Aggregate totals across all systems in the group
        const groupStats = systemVulnCounts.reduce(
          (acc, systemStats) => ({
            total: acc.total + systemStats.total,
            high: acc.high + systemStats.high,
            medium: acc.medium + systemStats.medium,
            low: acc.low + systemStats.low,
          }),
          { total: 0, high: 0, medium: 0, low: 0 }
        );

        // Calculate compliance score (placeholder logic)
        const complianceScore = groupStats.total > 0
          ? Math.max(0, 100 - Math.min(100, groupStats.total * 2))
          : 100;

        return {
          ...group,
          stats: {
            totalFindings: groupStats.total,
            criticalFindings: groupStats.high, // Treating high as critical for now
            highFindings: groupStats.high,
            mediumFindings: groupStats.medium,
            lowFindings: groupStats.low,
            openFindings: groupStats.total, // All findings are considered open for now
            complianceScore: complianceScore,
          }
        };
      })
    );

    return { items: enrichedGroups };
  }

  async findOne(id: number): Promise<Group | null> {
    return this.prisma.group.findUnique({
      where: { id },
      include: {
        package: true,
        systems: true,
        poams: true,
      },
    });
  }

  async update(id: number, updateGroupDto: UpdateGroupDto): Promise<Group> {
    return this.prisma.group.update({
      where: { id },
      data: updateGroupDto,
      include: {
        package: true,
        systems: true,
        _count: {
          select: {
            systems: true,
            poams: true,
          },
        },
      },
    });
  }

  async remove(id: number): Promise<Group> {
    return this.prisma.group.delete({
      where: { id },
    });
  }
}
