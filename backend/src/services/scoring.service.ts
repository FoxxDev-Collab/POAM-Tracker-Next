import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface SystemScoreData {
  systemId: number;
  systemName: string;
  assessmentCompleteness: number;
  overallCompliance: number;
  totalFindings: number;
  openFindings: number;
  notReviewedFindings: number;
  catIOpen: number;
  catIIOpen: number;
  catIIIOpen: number;
}

@Injectable()
export class ScoringService {
  private readonly logger = new Logger(ScoringService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Calculate system score based on STIG findings
   * Uses the "weakest link" approach - no weighted averages
   */
  async calculateSystemScore(systemId: number, scanId?: number): Promise<void> {
    const findings = await this.prisma.stigFinding.findMany({
      where: {
        systemId,
        ...(scanId && { scanId }),
      },
    });

    if (findings.length === 0) {
      this.logger.warn(`No findings found for system ${systemId}`);
      return;
    }

    // Calculate metrics
    const totalFindings = findings.length;
    const notReviewedFindings = findings.filter(f => f.status === 'Not_Reviewed').length;
    const openFindings = findings.filter(f => f.status === 'Open').length;
    const compliantFindings = findings.filter(f =>
      f.status === 'Not_a_Finding' || f.status === 'Not_Applicable'
    ).length;

    // Category breakdowns - STIG only (CAT I/II/III)
    const catIFindings = findings.filter(f => f.severity === 'CAT_I');
    const catIIFindings = findings.filter(f => f.severity === 'CAT_II');
    const catIIIFindings = findings.filter(f => f.severity === 'CAT_III');

    const catIOpen = catIFindings.filter(f => f.status === 'Open').length;
    const catIIOpen = catIIFindings.filter(f => f.status === 'Open').length;
    const catIIIOpen = catIIIFindings.filter(f => f.status === 'Open').length;

    // Assessment completeness (0-100%)
    const assessmentProgress = ((totalFindings - notReviewedFindings) / totalFindings) * 100;

    // Compliance score (only for reviewed findings)
    const reviewedFindings = totalFindings - notReviewedFindings;
    const complianceScore = reviewedFindings > 0
      ? (compliantFindings / reviewedFindings) * 100
      : 0;

    // Store system score
    await this.prisma.systemScore.upsert({
      where: {
        systemId_scanId: {
          systemId,
          scanId: scanId || 0,
        },
      },
      update: {
        assessmentProgress,
        complianceScore,
        totalFindings,
        openFindings,
        notReviewedFindings,
        catIOpen,
        catIIOpen,
        catIIIOpen,
        calculatedAt: new Date(),
      },
      create: {
        systemId,
        scanId: scanId || 0,
        assessmentProgress,
        complianceScore,
        totalFindings,
        openFindings,
        notReviewedFindings,
        catIOpen,
        catIIOpen,
        catIIIOpen,
      },
    });

    this.logger.log(`System score calculated for system ${systemId}: ${complianceScore.toFixed(2)}% compliant`);
  }

  /**
   * Calculate group score based on worst-performing system
   */
  async calculateGroupScore(groupId: number): Promise<void> {
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
      include: { systems: true },
    });

    if (!group || group.systems.length === 0) {
      this.logger.warn(`No systems found for group ${groupId}`);
      return;
    }

    // Get all system scores for this group
    const systemScores = await Promise.all(
      group.systems.map(async (system) => {
        const latestScore = await this.prisma.systemScore.findFirst({
          where: { systemId: system.id },
          orderBy: { calculatedAt: 'desc' },
        });

        if (!latestScore) {
          // Calculate if missing
          await this.calculateSystemScore(system.id);
          return this.prisma.systemScore.findFirst({
            where: { systemId: system.id },
            orderBy: { calculatedAt: 'desc' },
          });
        }
        return latestScore;
      })
    );

    const validScores = systemScores.filter(s => s !== null);
    if (validScores.length === 0) {
      this.logger.warn(`No valid scores found for group ${groupId}`);
      return;
    }

    // Find worst performing system (lowest compliance score)
    const worstSystem = validScores.reduce((worst, current) =>
      current.complianceScore < worst.complianceScore ? current : worst
    );

    const bestSystem = validScores.reduce((best, current) =>
      current.complianceScore > best.complianceScore ? current : best
    );

    // Calculate group-level totals
    const totalFindings = validScores.reduce((sum, s) => sum + s.totalFindings, 0);
    const openFindings = validScores.reduce((sum, s) => sum + s.openFindings, 0);
    const notReviewedFindings = validScores.reduce((sum, s) => sum + s.notReviewedFindings, 0);
    const catIOpen = validScores.reduce((sum, s) => sum + s.catIOpen, 0);
    const catIIOpen = validScores.reduce((sum, s) => sum + s.catIIOpen, 0);
    const catIIIOpen = validScores.reduce((sum, s) => sum + s.catIIIOpen, 0);

    // Group assessment completeness (average of all systems)
    const avgAssessmentCompleteness = validScores.reduce((sum, s) =>
      sum + s.assessmentProgress, 0) / validScores.length;

    // Count complete assessments
    const completeAssessments = validScores.filter(s => s.assessmentProgress === 100).length;

    // Get worst system details
    const worstSystemDetails = await this.prisma.system.findUnique({
      where: { id: worstSystem.systemId },
      select: { id: true, name: true },
    });

    // Count affected controls - get unique controls
    const affectedControls = await this.prisma.controlSystemStatus.findMany({
      where: {
        systemId: { in: group.systems.map(s => s.id) },
        hasFindings: true,
      },
      distinct: ['controlId'],
      select: { controlId: true },
    });
    const controlsAffected = affectedControls.length;

    const compliantControls = await this.prisma.controlSystemStatus.findMany({
      where: {
        systemId: { in: group.systems.map(s => s.id) },
        openCount: 0,
      },
      distinct: ['controlId'],
      select: { controlId: true },
    });
    const controlsCompliant = compliantControls.length;

    // Store group score
    await this.prisma.groupScore.create({
      data: {
        groupId,
        assessmentCompleteness: avgAssessmentCompleteness,
        overallCompliance: worstSystem.complianceScore, // Use worst system's score
        totalSystems: group.systems.length,
        completeAssessments,
        highestSystemScore: bestSystem.complianceScore,
        lowestSystemScore: worstSystem.complianceScore,
        worstSystemId: worstSystemDetails?.id,
        worstSystemName: worstSystemDetails?.name,
        totalFindings,
        openFindings,
        notReviewedFindings,
        catITotal: catIOpen, // For now, just track open counts
        catIOpen,
        catIITotal: catIIOpen,
        catIIOpen,
        catIIITotal: catIIIOpen,
        catIIIOpen,
        controlsAffected,
        controlsCompliant,
      },
    });

    this.logger.log(`Group score calculated for group ${groupId}: ${worstSystem.complianceScore.toFixed(2)}% compliant (based on worst system)`);
  }

  /**
   * Calculate package score based on worst-performing group
   */
  async calculatePackageScore(packageId: number): Promise<void> {
    const pkg = await this.prisma.package.findUnique({
      where: { id: packageId },
      include: {
        groups: true,
        systems: true,
      },
    });

    if (!pkg) {
      this.logger.warn(`Package ${packageId} not found`);
      return;
    }

    // Calculate scores for all groups
    await Promise.all(pkg.groups.map(group => this.calculateGroupScore(group.id)));

    // Get all group scores
    const groupScores = await this.prisma.groupScore.findMany({
      where: { groupId: { in: pkg.groups.map(g => g.id) } },
      orderBy: { calculatedAt: 'desc' },
    });

    if (groupScores.length === 0) {
      this.logger.warn(`No group scores found for package ${packageId}`);
      return;
    }

    // Find worst performing group
    const worstGroup = groupScores.reduce((worst, current) =>
      current.overallCompliance < worst.overallCompliance ? current : worst
    );

    const bestGroup = groupScores.reduce((best, current) =>
      current.overallCompliance > best.overallCompliance ? current : best
    );

    // Calculate package-level totals
    const totalFindings = groupScores.reduce((sum, g) => sum + g.totalFindings, 0);
    const openFindings = groupScores.reduce((sum, g) => sum + g.openFindings, 0);
    const notReviewedFindings = groupScores.reduce((sum, g) => sum + g.notReviewedFindings, 0);
    const catIOpen = groupScores.reduce((sum, g) => sum + g.catIOpen, 0);
    const catIIOpen = groupScores.reduce((sum, g) => sum + g.catIIOpen, 0);
    const catIIIOpen = groupScores.reduce((sum, g) => sum + g.catIIIOpen, 0);

    // Package assessment completeness (average of all groups)
    const avgAssessmentCompleteness = groupScores.reduce((sum, g) =>
      sum + g.assessmentCompleteness, 0) / groupScores.length;

    // Count complete groups
    const completeGroups = groupScores.filter(g => g.assessmentCompleteness === 100).length;

    // Get worst group details
    const worstGroupDetails = await this.prisma.group.findUnique({
      where: { id: worstGroup.groupId },
      select: { id: true, name: true },
    });

    // Count affected controls across package - get unique controls
    const affectedControls = await this.prisma.controlSystemStatus.findMany({
      where: {
        systemId: { in: pkg.systems.map(s => s.id) },
        hasFindings: true,
      },
      distinct: ['controlId'],
      select: { controlId: true },
    });
    const controlsAffected = affectedControls.length;

    const compliantControls = await this.prisma.controlSystemStatus.findMany({
      where: {
        systemId: { in: pkg.systems.map(s => s.id) },
        openCount: 0,
      },
      distinct: ['controlId'],
      select: { controlId: true },
    });
    const controlsCompliant = compliantControls.length;

    // Store package score
    await this.prisma.packageScore.create({
      data: {
        packageId,
        assessmentCompleteness: avgAssessmentCompleteness,
        overallCompliance: worstGroup.overallCompliance, // Use worst group's score
        totalGroups: pkg.groups.length,
        completeGroups,
        highestGroupScore: bestGroup.overallCompliance,
        lowestGroupScore: worstGroup.overallCompliance,
        worstGroupId: worstGroupDetails?.id,
        worstGroupName: worstGroupDetails?.name,
        totalSystems: pkg.systems.length,
        completeAssessments: groupScores.reduce((sum, g) => sum + g.completeAssessments, 0),
        worstSystemId: worstGroup.worstSystemId,
        worstSystemName: worstGroup.worstSystemName,
        totalFindings,
        openFindings,
        notReviewedFindings,
        catITotal: catIOpen,
        catIOpen,
        catIITotal: catIIOpen,
        catIIOpen,
        catIIITotal: catIIIOpen,
        catIIIOpen,
        controlsAffected,
        controlsCompliant,
      },
    });

    this.logger.log(`Package score calculated for package ${packageId}: ${worstGroup.overallCompliance.toFixed(2)}% compliant (based on worst group)`);
  }

  /**
   * Update control status for a system
   */
  async updateControlSystemStatus(systemId: number): Promise<void> {
    // Get all findings with control mappings for this system
    const findings = await this.prisma.stigFinding.findMany({
      where: {
        systemId,
        controlId: { not: null },
      },
    });

    // Group findings by control
    const findingsByControl = findings.reduce((acc, finding) => {
      if (!finding.controlId) return acc;
      if (!acc[finding.controlId]) {
        acc[finding.controlId] = [];
      }
      acc[finding.controlId].push(finding);
      return acc;
    }, {} as Record<string, typeof findings>);

    // Update control status for each control
    await Promise.all(
      Object.entries(findingsByControl).map(async ([controlId, controlFindings]) => {
        const openCount = controlFindings.filter(f => f.status === 'Open').length;
        const criticalCount = controlFindings.filter(f =>
          f.status === 'Open' && f.severity === 'CAT_I'
        ).length;

        await this.prisma.controlSystemStatus.upsert({
          where: {
            controlId_systemId: {
              controlId,
              systemId,
            },
          },
          update: {
            hasFindings: controlFindings.length > 0,
            openCount,
            criticalCount,
            lastAssessed: new Date(),
          },
          create: {
            controlId,
            systemId,
            hasFindings: controlFindings.length > 0,
            openCount,
            criticalCount,
            lastAssessed: new Date(),
          },
        });
      })
    );

    this.logger.log(`Control status updated for system ${systemId}`);
  }

  /**
   * Update control status for a group
   */
  async updateControlGroupStatus(groupId: number): Promise<void> {
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
      include: { systems: true },
    });

    if (!group) return;

    // Get all control statuses for systems in this group
    const controlStatuses = await this.prisma.controlSystemStatus.findMany({
      where: {
        systemId: { in: group.systems.map(s => s.id) },
      },
    });

    // Group by control
    const statusByControl = controlStatuses.reduce((acc, status) => {
      if (!acc[status.controlId]) {
        acc[status.controlId] = [];
      }
      acc[status.controlId].push(status);
      return acc;
    }, {} as Record<string, typeof controlStatuses>);

    // Update group control status
    await Promise.all(
      Object.entries(statusByControl).map(async ([controlId, statuses]) => {
        const systemsAffected = statuses.length;
        const systemsCompliant = statuses.filter(s => s.openCount === 0).length;
        const totalFindings = statuses.reduce((sum, s) => sum + (s.openCount || 0), 0);
        const catIOpen = statuses.reduce((sum, s) => sum + (s.criticalCount || 0), 0);

        // Assessment is complete if all systems have been assessed
        const assessmentComplete = systemsAffected === group.systems.length;

        // Determine status based on worst system
        let status = 'Compliant';
        if (!assessmentComplete) {
          status = 'Assessment_Incomplete';
        } else if (catIOpen > 0) {
          status = 'Non_Compliant';
        } else if (totalFindings > 0) {
          status = 'Non_Compliant';
        }

        await this.prisma.controlGroupStatus.upsert({
          where: {
            controlId_groupId: {
              controlId,
              groupId,
            },
          },
          update: {
            systemsAffected,
            systemsCompliant,
            assessmentComplete,
            totalFindings,
            openFindings: totalFindings,
            catIOpen,
            catIIOpen: 0, // Would need more data to calculate
            catIIIOpen: 0, // Would need more data to calculate
            status,
            lastAssessed: new Date(),
          },
          create: {
            controlId,
            groupId,
            systemsAffected,
            systemsCompliant,
            assessmentComplete,
            totalFindings,
            openFindings: totalFindings,
            catIOpen,
            catIIOpen: 0,
            catIIIOpen: 0,
            status,
            lastAssessed: new Date(),
          },
        });
      })
    );

    this.logger.log(`Control status updated for group ${groupId}`);
  }

}