import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface ControlComplianceScore {
  controlId: string;
  complianceStatus: 'NOT_ASSESSED' | 'NC_U' | 'NC_O' | 'CU' | 'CO' | 'NA_U' | 'NA_O';
  overallScore: number;
  assessmentProgress: number;
  totalFindings: number;
  openFindings: number;
  notReviewedFindings: number;
  catIOpen: number;
  catIIOpen: number;
  catIIIOpen: number;
  systemsAssessed: number;
  totalSystems: number;
  lastAssessed: Date;
}

export interface SystemControlAssessment {
  systemId: number;
  controlId: string;
  hasFindings: boolean;
  openCount: number;
  criticalCount: number;
  totalFindings: number;
  complianceScore: number;
  lastAssessed: Date;
}

@Injectable()
export class ControlComplianceService {
  private readonly logger = new Logger(ControlComplianceService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Updates NIST control compliance status based on STIG findings across all systems
   */
  async updateControlComplianceFromStigFindings(controlId?: string): Promise<void> {
    this.logger.log(`Updating control compliance${controlId ? ` for ${controlId}` : ' for all controls'}`);

    // Get controls to update (specific control or all controls with findings)
    const controlsToUpdate = controlId 
      ? [controlId]
      : await this.getControlsWithFindings();

    for (const ctrlId of controlsToUpdate) {
      await this.updateSingleControlCompliance(ctrlId);
    }

    this.logger.log(`Completed control compliance update for ${controlsToUpdate.length} controls`);
  }

  /**
   * Updates compliance status for a single NIST control based on STIG findings
   */
  private async updateSingleControlCompliance(controlId: string): Promise<void> {
    try {
      // Calculate control compliance score
      const complianceScore = await this.calculateControlComplianceScore(controlId);
      
      if (!complianceScore) {
        this.logger.warn(`No findings found for control ${controlId}, skipping update`);
        return;
      }

      // Update NIST control with calculated compliance status
      await this.prisma.nistControl.update({
        where: { controlId },
        data: {
          complianceStatus: complianceScore.complianceStatus,
          complianceNotes: this.generateComplianceNotes(complianceScore),
          assessedAt: new Date(),
        },
      });

      // Update associated CCIs
      await this.updateCciComplianceForControl(controlId, complianceScore);

      this.logger.debug(`Updated compliance for control ${controlId}: ${complianceScore.complianceStatus} (${complianceScore.overallScore}%)`);
    } catch (error) {
      this.logger.error(`Failed to update compliance for control ${controlId}:`, error);
    }
  }

  /**
   * Calculates comprehensive compliance score for a NIST control
   */
  async calculateControlComplianceScore(controlId: string): Promise<ControlComplianceScore | null> {
    // Get all systems that have findings for this control
    const systemAssessments = await this.getSystemControlAssessments(controlId);
    
    if (systemAssessments.length === 0) {
      return null;
    }

    // Aggregate findings across all systems
    const totalFindings = systemAssessments.reduce((sum, sa) => sum + sa.totalFindings, 0);
    const openFindings = systemAssessments.reduce((sum, sa) => sum + sa.openCount, 0);
    const criticalFindings = systemAssessments.reduce((sum, sa) => sum + sa.criticalCount, 0);

    // Get detailed findings for more granular analysis
    const allFindings = await this.prisma.stigFinding.findMany({
      where: {
        controlId,
        systemId: { in: systemAssessments.map(sa => sa.systemId) },
      },
    });

    const notReviewedFindings = allFindings.filter(f => f.status === 'Not_Reviewed').length;
    const catIOpen = allFindings.filter(f => f.status === 'Open' && f.severity === 'CAT_I').length;
    const catIIOpen = allFindings.filter(f => f.status === 'Open' && f.severity === 'CAT_II').length;
    const catIIIOpen = allFindings.filter(f => f.status === 'Open' && f.severity === 'CAT_III').length;

    // Calculate assessment progress (percentage of findings reviewed)
    const reviewedFindings = totalFindings - notReviewedFindings;
    const assessmentProgress = totalFindings > 0 ? (reviewedFindings / totalFindings) * 100 : 0;

    // Calculate compliance score using weighted approach
    const complianceScore = this.calculateWeightedComplianceScore(allFindings);

    // Determine overall compliance status
    const complianceStatus = this.determineComplianceStatus(
      complianceScore,
      assessmentProgress,
      criticalFindings,
      openFindings
    );

    return {
      controlId,
      complianceStatus,
      overallScore: complianceScore,
      assessmentProgress,
      totalFindings,
      openFindings,
      notReviewedFindings,
      catIOpen,
      catIIOpen,
      catIIIOpen,
      systemsAssessed: systemAssessments.length,
      totalSystems: await this.getTotalSystemsCount(),
      lastAssessed: new Date(),
    };
  }

  /**
   * Calculates weighted compliance score based on finding severity and status
   */
  private calculateWeightedComplianceScore(findings: any[]): number {
    if (findings.length === 0) return 100;

    let totalWeight = 0;
    let compliantWeight = 0;

    for (const finding of findings) {
      // Assign weights based on severity (as mentioned in roadmap, you might want to keep CAT scores separate)
      const weight = this.getSeverityWeight(finding.severity);
      totalWeight += weight;

      // Add to compliant weight if finding is resolved
      if (finding.status === 'Not_a_Finding' || finding.status === 'Not_Applicable') {
        compliantWeight += weight;
      }
    }

    return totalWeight > 0 ? Math.round((compliantWeight / totalWeight) * 100) : 0;
  }

  /**
   * Gets severity weight for scoring calculations
   */
  private getSeverityWeight(severity: string): number {
    switch (severity) {
      case 'CAT_I': return 10;  // Critical findings have highest weight
      case 'CAT_II': return 5;  // Medium findings
      case 'CAT_III': return 1; // Low findings have lowest weight
      default: return 3;        // Default weight for unknown severities
    }
  }

  /**
   * Determines compliance status based on score and assessment completeness
   */
  private determineComplianceStatus(
    score: number,
    assessmentProgress: number,
    criticalFindings: number,
    openFindings: number
  ): 'NOT_ASSESSED' | 'NC_U' | 'NC_O' | 'CU' | 'CO' | 'NA_U' | 'NA_O' {
    // Not assessed if less than 80% of findings reviewed
    if (assessmentProgress < 80) {
      return 'NOT_ASSESSED';
    }

    // Non-compliant if any critical findings are open
    if (criticalFindings > 0) {
      return 'NC_U'; // Non-Compliant Unofficial (from automated assessment)
    }

    // Compliance thresholds (using unofficial status for automated assessments)
    if (score >= 95) {
      return 'CU'; // Compliant Unofficial
    } else if (score >= 70) {
      return 'CU'; // Still compliant but with some issues
    } else {
      return 'NC_U'; // Non-Compliant Unofficial
    }
  }

  /**
   * Gets system-level control assessments
   */
  private async getSystemControlAssessments(controlId: string): Promise<SystemControlAssessment[]> {
    const systemStatuses = await this.prisma.controlSystemStatus.findMany({
      where: { controlId },
      include: {
        system: {
          select: { id: true, name: true },
        },
      },
    });

    const assessments: SystemControlAssessment[] = [];

    for (const status of systemStatuses) {
      // Get total findings for this system/control combination
      const totalFindings = await this.prisma.stigFinding.count({
        where: {
          systemId: status.systemId,
          controlId,
        },
      });

      // Calculate system-level compliance score
      const systemFindings = await this.prisma.stigFinding.findMany({
        where: {
          systemId: status.systemId,
          controlId,
        },
      });

      const complianceScore = this.calculateWeightedComplianceScore(systemFindings);

      assessments.push({
        systemId: status.systemId,
        controlId,
        hasFindings: status.hasFindings,
        openCount: status.openCount,
        criticalCount: status.criticalCount,
        totalFindings,
        complianceScore,
        lastAssessed: status.lastAssessed,
      });
    }

    return assessments;
  }

  /**
   * Updates CCI compliance status for a control
   */
  private async updateCciComplianceForControl(
    controlId: string,
    complianceScore: ControlComplianceScore
  ): Promise<void> {
    // Get all CCIs associated with this control
    const control = await this.prisma.nistControl.findUnique({
      where: { controlId },
      include: { ccis: true },
    });

    if (!control || !control.ccis.length) {
      return;
    }

    // Update each CCI with the control's compliance status
    for (const cci of control.ccis) {
      await this.prisma.nistControlCci.update({
        where: { id: cci.id },
        data: {
          complianceStatus: complianceScore.complianceStatus,
          complianceNotes: `Auto-updated from STIG findings. Score: ${complianceScore.overallScore}%`,
          assessedAt: new Date(),
        },
      });
    }
  }

  /**
   * Generates compliance notes based on assessment results
   */
  private generateComplianceNotes(score: ControlComplianceScore): string {
    const notes = [
      `Compliance Score: ${score.overallScore}%`,
      `Assessment Progress: ${score.assessmentProgress.toFixed(1)}%`,
      `Systems Assessed: ${score.systemsAssessed}/${score.totalSystems}`,
      `Total Findings: ${score.totalFindings}`,
      `Open Findings: ${score.openFindings}`,
    ];

    if (score.catIOpen > 0) {
      notes.push(`Critical (CAT I) Open: ${score.catIOpen}`);
    }
    if (score.catIIOpen > 0) {
      notes.push(`Medium (CAT II) Open: ${score.catIIOpen}`);
    }
    if (score.catIIIOpen > 0) {
      notes.push(`Low (CAT III) Open: ${score.catIIIOpen}`);
    }

    notes.push(`Last Updated: ${score.lastAssessed.toISOString()}`);

    return notes.join(' | ');
  }

  /**
   * Gets all controls that have STIG findings
   */
  private async getControlsWithFindings(): Promise<string[]> {
    const result = await this.prisma.stigFinding.findMany({
      where: {
        controlId: { not: null },
      },
      select: {
        controlId: true,
      },
      distinct: ['controlId'],
    });

    return result
      .map(r => r.controlId)
      .filter((id): id is string => id !== null);
  }

  /**
   * Gets total number of systems in the organization
   */
  private async getTotalSystemsCount(): Promise<number> {
    return this.prisma.system.count();
  }

  /**
   * Gets control compliance summary for reporting
   */
  async getControlComplianceSummary(controlId?: string) {
    const where = controlId ? { controlId } : {};
    
    const controls = await this.prisma.nistControl.findMany({
      where,
      include: {
        ccis: true,
      },
      orderBy: { controlId: 'asc' },
    });

    const summary: any[] = [];

    for (const control of controls) {
      const complianceScore = await this.calculateControlComplianceScore(control.controlId);
      
      if (complianceScore) {
        summary.push({
          ...control,
          complianceScore,
        });
      }
    }

    return summary;
  }

  /**
   * Triggers control compliance update after STIG import
   */
  async updateComplianceAfterStigImport(systemId: number, scanId: number): Promise<void> {
    this.logger.log(`Updating control compliance after STIG import for system ${systemId}, scan ${scanId}`);

    // Get all controls affected by this scan
    const affectedControls = await this.prisma.stigFinding.findMany({
      where: {
        systemId,
        scanId,
        controlId: { not: null },
      },
      select: {
        controlId: true,
      },
      distinct: ['controlId'],
    });

    // Update compliance for each affected control
    for (const finding of affectedControls) {
      if (finding.controlId) {
        await this.updateSingleControlCompliance(finding.controlId);
      }
    }

    this.logger.log(`Completed control compliance update for ${affectedControls.length} controls`);
  }
}
