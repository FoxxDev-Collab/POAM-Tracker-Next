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
            let catI = 0;
            let catII = 0;
            let catIII = 0;

            vulnerabilityCounts.forEach((count) => {
              const severity = count.severity || '';
              const countValue = count._count.severity;

              total += countValue;

              if (severity === 'CAT_I') {
                catI += countValue;
              } else if (severity === 'CAT_II') {
                catII += countValue;
              } else if (severity === 'CAT_III') {
                catIII += countValue;
              }
            });

            return { total, catI, catII, catIII };
          })
        );

        // Aggregate totals across all systems in the group
        const groupStats = systemVulnCounts.reduce(
          (acc, systemStats) => ({
            total: acc.total + systemStats.total,
            catI: acc.catI + systemStats.catI,
            catII: acc.catII + systemStats.catII,
            catIII: acc.catIII + systemStats.catIII,
          }),
          { total: 0, catI: 0, catII: 0, catIII: 0 }
        );

        // Calculate compliance score (placeholder logic)
        const complianceScore = groupStats.total > 0
          ? Math.max(0, 100 - Math.min(100, groupStats.total * 2))
          : 100;

        return {
          ...group,
          stats: {
            totalFindings: groupStats.total,
            catIFindings: groupStats.catI,
            catIIFindings: groupStats.catII,
            catIIIFindings: groupStats.catIII,
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
