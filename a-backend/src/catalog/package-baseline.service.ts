import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ComplianceStatus } from '@prisma/client';

interface BaselineControl {
  controlId: string;
  includeInBaseline: boolean;
  baselineSource?: string;
  tailoringAction?: string;
  tailoringRationale?: string;
  implementationStatus?: string;
  implementationNotes?: string;
  complianceStatus?: ComplianceStatus;
  complianceNotes?: string;
}

// NIST 800-53 Rev 5 baseline definitions
const NIST_BASELINES = {
  Low: [
    'AC-1', 'AC-2', 'AC-3', 'AC-7', 'AC-8', 'AC-14', 'AC-17', 'AC-18', 'AC-19', 'AC-20', 'AC-22',
    'AT-1', 'AT-2', 'AT-3', 'AT-4',
    'AU-1', 'AU-2', 'AU-3', 'AU-4', 'AU-5', 'AU-6', 'AU-8', 'AU-9', 'AU-11', 'AU-12',
    'CA-1', 'CA-2', 'CA-3', 'CA-5', 'CA-6', 'CA-7', 'CA-9',
    'CM-1', 'CM-2', 'CM-4', 'CM-5', 'CM-6', 'CM-7', 'CM-8', 'CM-10', 'CM-11',
    'CP-1', 'CP-2', 'CP-3', 'CP-4', 'CP-9', 'CP-10',
    'IA-1', 'IA-2', 'IA-4', 'IA-5', 'IA-6', 'IA-7', 'IA-8', 'IA-11',
    'IR-1', 'IR-2', 'IR-4', 'IR-5', 'IR-6', 'IR-7', 'IR-8',
    'MA-1', 'MA-2', 'MA-4', 'MA-5',
    'MP-1', 'MP-2', 'MP-6', 'MP-7',
    'PE-1', 'PE-2', 'PE-3', 'PE-6', 'PE-8', 'PE-12', 'PE-13', 'PE-14', 'PE-15', 'PE-16',
    'PL-1', 'PL-2', 'PL-4', 'PL-10', 'PL-11',
    'PS-1', 'PS-2', 'PS-3', 'PS-4', 'PS-5', 'PS-6', 'PS-7', 'PS-8',
    'RA-1', 'RA-2', 'RA-3', 'RA-5',
    'SA-1', 'SA-2', 'SA-3', 'SA-4', 'SA-5', 'SA-8', 'SA-9', 'SA-22',
    'SC-1', 'SC-5', 'SC-7', 'SC-12', 'SC-13', 'SC-20', 'SC-21', 'SC-22', 'SC-39',
    'SI-1', 'SI-2', 'SI-3', 'SI-4', 'SI-5', 'SI-12',
    'SR-1', 'SR-2', 'SR-3', 'SR-5', 'SR-10', 'SR-11',
  ],
  Moderate: [
    // Includes all Low controls plus:
    'AC-2(1)', 'AC-2(2)', 'AC-2(3)', 'AC-2(4)', 'AC-3(7)', 'AC-4', 'AC-5', 'AC-6', 'AC-6(1)', 'AC-6(2)',
    'AC-6(5)', 'AC-6(9)', 'AC-6(10)', 'AC-11', 'AC-11(1)', 'AC-12', 'AC-17(1)', 'AC-17(2)', 'AC-17(3)',
    'AC-17(4)', 'AC-18(1)', 'AC-19(5)', 'AC-20(1)', 'AC-20(2)', 'AC-21', 'AC-22(1)',
    'AT-2(2)',
    'AU-2(3)', 'AU-3(1)', 'AU-6(1)', 'AU-6(3)', 'AU-7', 'AU-7(1)', 'AU-9(4)', 'AU-12(3)',
    'CA-2(1)', 'CA-3(5)', 'CA-7(1)',
    'CM-2(2)', 'CM-2(3)', 'CM-3', 'CM-3(2)', 'CM-4(1)', 'CM-5(1)', 'CM-6(1)', 'CM-7(1)', 'CM-7(2)',
    'CM-8(1)', 'CM-8(3)', 'CM-9', 'CM-11(2)',
    'CP-2(1)', 'CP-2(3)', 'CP-2(8)', 'CP-3(1)', 'CP-4(1)', 'CP-6', 'CP-6(1)', 'CP-6(3)', 'CP-7',
    'CP-7(1)', 'CP-7(2)', 'CP-7(3)', 'CP-8', 'CP-9(1)', 'CP-10(2)',
    'IA-2(1)', 'IA-2(2)', 'IA-2(8)', 'IA-2(12)', 'IA-3', 'IA-4(4)', 'IA-5(1)', 'IA-5(2)', 'IA-5(6)',
    'IA-8(1)', 'IA-8(2)', 'IA-8(4)', 'IA-12',
    'IR-2(1)', 'IR-2(2)', 'IR-3', 'IR-3(2)', 'IR-4(1)', 'IR-6(1)', 'IR-6(3)', 'IR-7(1)',
    'MA-2(2)', 'MA-3', 'MA-3(1)', 'MA-3(2)', 'MA-5(1)', 'MA-6',
    'MP-3', 'MP-4', 'MP-5', 'MP-6(8)',
    'PE-3(1)', 'PE-4', 'PE-5', 'PE-6(1)', 'PE-6(4)', 'PE-8(1)', 'PE-9', 'PE-10', 'PE-11', 'PE-12(1)',
    'PE-13(2)', 'PE-13(3)', 'PE-14(2)', 'PE-15(1)', 'PE-17',
    'PL-4(1)', 'PL-8',
    'PS-3(3)', 'PS-4(2)', 'PS-5(2)', 'PS-6(2)', 'PS-7(1)',
    'PT-1', 'PT-2', 'PT-3', 'PT-4', 'PT-5',
    'RA-3(1)', 'RA-5(2)', 'RA-5(5)', 'RA-7',
    'SA-3(1)', 'SA-4(1)', 'SA-4(2)', 'SA-4(9)', 'SA-4(10)', 'SA-5(1)', 'SA-8(2)', 'SA-9(2)', 'SA-10',
    'SA-11', 'SA-15', 'SA-16', 'SA-22(1)',
    'SC-2', 'SC-4', 'SC-8', 'SC-8(1)', 'SC-10', 'SC-12(1)', 'SC-13(1)', 'SC-15', 'SC-17', 'SC-18',
    'SC-20(2)', 'SC-21(1)', 'SC-23', 'SC-28', 'SC-28(1)',
    'SI-2(2)', 'SI-3(8)', 'SI-4(2)', 'SI-4(4)', 'SI-4(5)', 'SI-7', 'SI-8', 'SI-8(1)', 'SI-8(2)',
    'SI-10', 'SI-11', 'SI-16',
    'SR-2(1)', 'SR-4', 'SR-6', 'SR-8', 'SR-11(1)', 'SR-11(2)',
  ],
  High: [
    // Includes all Low and Moderate controls plus:
    'AC-2(5)', 'AC-2(11)', 'AC-2(12)', 'AC-2(13)', 'AC-3(2)', 'AC-3(3)', 'AC-3(4)', 'AC-4(2)',
    'AC-4(4)', 'AC-6(3)', 'AC-6(7)', 'AC-6(8)', 'AC-10', 'AC-17(9)', 'AC-18(3)', 'AC-18(4)', 'AC-18(5)',
    'AU-3(2)', 'AU-4(1)', 'AU-5(1)', 'AU-5(2)', 'AU-6(5)', 'AU-6(6)', 'AU-9(2)', 'AU-9(3)', 'AU-10',
    'AU-12(1)', 'AU-13', 'AU-14', 'AU-14(1)',
    'CA-2(2)', 'CA-3(2)', 'CA-7(3)', 'CA-8', 'CA-8(1)',
    'CM-2(7)', 'CM-3(1)', 'CM-3(4)', 'CM-3(6)', 'CM-4(2)', 'CM-5(2)', 'CM-5(3)', 'CM-6(2)', 'CM-7(5)',
    'CM-8(2)', 'CM-8(4)', 'CM-12', 'CM-12(1)',
    'CP-2(2)', 'CP-2(4)', 'CP-2(5)', 'CP-3(2)', 'CP-4(2)', 'CP-4(4)', 'CP-6(2)', 'CP-7(4)', 'CP-8(1)',
    'CP-8(2)', 'CP-8(3)', 'CP-8(4)', 'CP-9(2)', 'CP-9(3)', 'CP-9(5)', 'CP-10(4)', 'CP-13',
    'IA-2(5)', 'IA-3(1)', 'IA-5(5)', 'IA-5(8)', 'IA-5(13)', 'IA-8(5)',
    'IR-4(4)', 'IR-4(6)', 'IR-4(7)', 'IR-4(8)', 'IR-5(1)', 'IR-6(2)', 'IR-9', 'IR-9(1)', 'IR-9(2)',
    'IR-9(3)', 'IR-9(4)', 'IR-10',
    'MA-3(3)', 'MA-4(3)', 'MA-5(4)',
    'MP-5(3)',
    'PE-3(2)', 'PE-3(3)', 'PE-11(2)', 'PE-13(1)', 'PE-18', 'PE-19', 'PE-20',
    'PL-8(1)', 'PL-9',
    'PM-1', 'PM-2', 'PM-3', 'PM-4', 'PM-5', 'PM-6', 'PM-7', 'PM-8', 'PM-9', 'PM-10', 'PM-11',
    'PM-12', 'PM-13', 'PM-14', 'PM-15', 'PM-16', 'PM-17', 'PM-18', 'PM-19', 'PM-20', 'PM-21',
    'PM-22', 'PM-23', 'PM-24', 'PM-25', 'PM-26', 'PM-27', 'PM-28', 'PM-29', 'PM-30', 'PM-31', 'PM-32',
    'PS-3(1)', 'PS-4(1)', 'PS-5(1)', 'PS-6(1)',
    'PT-2(2)', 'PT-4(1)', 'PT-4(2)', 'PT-5(1)', 'PT-5(2)',
    'RA-5(4)', 'RA-5(11)', 'RA-6', 'RA-8', 'RA-9', 'RA-10',
    'SA-4(3)', 'SA-4(5)', 'SA-4(6)', 'SA-9(3)', 'SA-11(1)', 'SA-11(5)', 'SA-11(8)', 'SA-12', 'SA-15(3)',
    'SA-15(4)', 'SA-15(11)', 'SA-17', 'SA-20', 'SA-21',
    'SC-3', 'SC-3(3)', 'SC-3(4)', 'SC-7(3)', 'SC-7(4)', 'SC-7(5)', 'SC-7(7)', 'SC-7(8)', 'SC-7(18)',
    'SC-7(21)', 'SC-8(2)', 'SC-8(3)', 'SC-8(4)', 'SC-11', 'SC-12(2)', 'SC-12(3)', 'SC-13(2)', 'SC-16',
    'SC-18(1)', 'SC-18(4)', 'SC-24', 'SC-25', 'SC-26', 'SC-27', 'SC-28(2)', 'SC-29', 'SC-30', 'SC-30(2)',
    'SC-31', 'SC-31(1)', 'SC-32', 'SC-34', 'SC-34(2)', 'SC-35', 'SC-36', 'SC-37', 'SC-38', 'SC-40',
    'SC-40(1)', 'SC-40(2)', 'SC-40(3)', 'SC-40(4)', 'SC-41', 'SC-43',
    'SI-4(10)', 'SI-4(12)', 'SI-4(13)', 'SI-4(14)', 'SI-4(20)', 'SI-4(22)', 'SI-4(23)', 'SI-6', 'SI-7(1)',
    'SI-7(5)', 'SI-7(7)', 'SI-7(15)', 'SI-13', 'SI-14', 'SI-15', 'SI-17', 'SI-19', 'SI-20', 'SI-21',
    'SI-22', 'SI-23',
    'SR-9', 'SR-9(1)', 'SR-11(3)', 'SR-12',
  ],
};

@Injectable()
export class PackageBaselineService {
  private readonly logger = new Logger(PackageBaselineService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Initialize package baseline with selected NIST baseline
   */
  async initializePackageBaseline(
    packageId: number,
    baselineLevel: 'Low' | 'Moderate' | 'High',
    userId?: number,
  ) {
    this.logger.log(`Initializing ${baselineLevel} baseline for package ${packageId}`);

    // Get all controls for the selected baseline
    const baselineControls = this.getBaselineControls(baselineLevel);

    // Create baseline entries for each control
    const baselineEntries = baselineControls.map(controlId => ({
      packageId,
      controlId,
      includeInBaseline: true,
      baselineSource: baselineLevel,
      addedBy: userId,
    }));

    // Bulk create baseline entries
    const result = await this.prisma.packageControlBaseline.createMany({
      data: baselineEntries,
      skipDuplicates: true,
    });

    this.logger.log(`Created ${result.count} baseline entries for package ${packageId}`);
    return result;
  }

  /**
   * Get all controls for a baseline level (cumulative)
   */
  private getBaselineControls(level: 'Low' | 'Moderate' | 'High'): string[] {
    const controls = new Set<string>();

    // Low baseline
    NIST_BASELINES.Low.forEach(c => controls.add(c));

    // Add Moderate controls if applicable
    if (level === 'Moderate' || level === 'High') {
      NIST_BASELINES.Moderate.forEach(c => controls.add(c));
    }

    // Add High controls if applicable
    if (level === 'High') {
      NIST_BASELINES.High.forEach(c => controls.add(c));
    }

    return Array.from(controls);
  }

  /**
   * Get package baseline controls
   */
  async getPackageBaseline(packageId: number) {
    const baseline = await this.prisma.packageControlBaseline.findMany({
      where: { packageId },
      orderBy: { controlId: 'asc' },
    });

    // Get all NIST controls to merge with baseline
    const allControls = await this.prisma.nistControl.findMany({
      select: {
        controlId: true,
        name: true,
        controlText: true,
      },
      orderBy: { controlId: 'asc' },
    });

    // Merge baseline data with control details
    const controlMap = new Map(allControls.map(c => [c.controlId, c]));
    const mergedBaseline = baseline.map(b => ({
      ...b,
      controlDetails: controlMap.get(b.controlId),
    }));

    return {
      packageId,
      controls: mergedBaseline,
      summary: {
        total: baseline.length,
        included: baseline.filter(b => b.includeInBaseline).length,
        tailored: baseline.filter(b => b.tailoringAction).length,
        implemented: baseline.filter(b => b.implementationStatus === 'Implemented').length,
        partiallyImplemented: baseline.filter(b => b.implementationStatus === 'Partially_Implemented').length,
        notImplemented: baseline.filter(b => b.implementationStatus === 'Not_Implemented').length,
      },
    };
  }

  /**
   * Update control in package baseline (tailoring)
   */
  async updateBaselineControl(
    packageId: number,
    controlId: string,
    updates: Partial<BaselineControl>,
    userId?: number,
  ) {
    // First check if the NIST control exists in the database
    const nistControl = await this.prisma.nistControl.findUnique({
      where: { controlId },
    });

    if (!nistControl) {
      // Control doesn't exist in NIST catalog, can't add to baseline
      this.logger.warn(`Control ${controlId} not found in NIST catalog`);
      throw new Error(`Control ${controlId} not found in NIST catalog. Please import the NIST catalog first.`);
    }

    // Check if control exists in baseline
    const existing = await this.prisma.packageControlBaseline.findUnique({
      where: {
        packageId_controlId: {
          packageId,
          controlId,
        },
      },
    });

    if (existing) {
      // Update existing baseline control
      return this.prisma.packageControlBaseline.update({
        where: {
          packageId_controlId: {
            packageId,
            controlId,
          },
        },
        data: {
          ...updates,
          updatedBy: userId,
        },
      });
    } else {
      // Create new baseline control (for tailoring - adding control)
      return this.prisma.packageControlBaseline.create({
        data: {
          packageId,
          controlId,
          ...updates,
          includeInBaseline: updates.includeInBaseline ?? true,
          tailoringAction: updates.tailoringAction ?? 'Added',
          addedBy: userId,
          updatedBy: userId,
        },
      });
    }
  }

  /**
   * Bulk update baseline controls
   */
  async bulkUpdateBaseline(
    packageId: number,
    controlUpdates: Array<{ controlId: string } & Partial<BaselineControl>>,
    userId?: number,
  ): Promise<any[]> {
    const results: any[] = [];

    for (const update of controlUpdates) {
      const { controlId, ...data } = update;
      const result = await this.updateBaselineControl(packageId, controlId, data, userId);
      results.push(result);
    }

    return results;
  }

  /**
   * Remove control from baseline (tailoring)
   */
  async removeFromBaseline(packageId: number, controlId: string, rationale: string, userId?: number) {
    return this.updateBaselineControl(
      packageId,
      controlId,
      {
        includeInBaseline: false,
        tailoringAction: 'Removed',
        tailoringRationale: rationale,
      },
      userId,
    );
  }

  /**
   * Get package control status grouped by family
   */
  async getPackageControlStatusByFamily(packageId: number) {
    // Get all baseline controls for the package
    const baselineControls = await this.prisma.packageControlBaseline.findMany({
      where: {
        packageId,
        includeInBaseline: true,
      },
    });

    // Get package compliance data from STIG findings
    const packageScore = await this.prisma.packageScore.findFirst({
      where: { packageId },
      orderBy: { calculatedAt: 'desc' },
    });

    // Get package systems for STIG data lookup
    const packageSystems = await this.prisma.system.findMany({
      where: { packageId },
      select: { id: true },
    });

    // Get control status from vulnerability center data
    const controlPackageStatus = await this.prisma.controlPackageStatus.findMany({
      where: { packageId },
    });

    // Group controls by family
    const families: Record<string, any> = {};
    const familyPrefixes = ['AC', 'AT', 'AU', 'CA', 'CM', 'CP', 'IA', 'IR', 'MA', 'MP',
                           'PE', 'PL', 'PM', 'PS', 'PT', 'RA', 'SA', 'SC', 'SI', 'SR'];

    // Initialize all families
    familyPrefixes.forEach(family => {
      families[family] = {
        totalControls: 0,
        implementedControls: 0,
        compliantControls: 0,
        compliancePercentage: 0,
        baselineControls: [],
        stigMappedControls: [],
      };
    });

    // Count baseline controls per family
    baselineControls.forEach(control => {
      const family = control.controlId.split('-')[0];
      if (families[family]) {
        families[family].totalControls++;
        families[family].baselineControls.push(control.controlId);

        // Check if control is implemented
        if (control.implementationStatus === 'Implemented' ||
            control.implementationStatus === 'Partially_Implemented') {
          families[family].implementedControls++;
        }

        // Check compliance from STIG findings
        const stigStatus = controlPackageStatus.find(s => s.controlId === control.controlId);
        if (stigStatus && stigStatus.status === 'Compliant') {
          families[family].compliantControls++;
        } else if (control.complianceStatus === 'CO' || control.complianceStatus === 'CU') {
          families[family].compliantControls++;
        }
      }
    });

    // Get STIG findings data for controls in this package
    const stigFindings = await this.prisma.stigFinding.findMany({
      where: {
        systemId: { in: packageSystems.map(s => s.id) },
        controlId: { not: null },
      },
      select: {
        controlId: true,
        status: true,
        severity: true,
        systemId: true,
      },
    });

    // Group STIG findings by control and calculate compliance
    const stigControlData = new Map<string, any>();
    stigFindings.forEach(finding => {
      if (!finding.controlId) return;

      if (!stigControlData.has(finding.controlId)) {
        stigControlData.set(finding.controlId, {
          totalFindings: 0,
          openFindings: 0,
          catIOpen: 0,
          catIIOpen: 0,
          catIIIOpen: 0,
          systemsAffected: new Set(),
        });
      }

      const data = stigControlData.get(finding.controlId);
      data.totalFindings++;
      data.systemsAffected.add(finding.systemId);

      if (finding.status === 'Open') {
        data.openFindings++;
        if (finding.severity === 'CAT_I') data.catIOpen++;
        else if (finding.severity === 'CAT_II') data.catIIOpen++;
        else if (finding.severity === 'CAT_III') data.catIIIOpen++;
      }
    });

    // Update families with STIG data
    Object.keys(families).forEach(family => {
      const familyControls = baselineControls.filter(c => c.controlId.startsWith(family));

      familyControls.forEach(control => {
        const stigData = stigControlData.get(control.controlId);
        if (stigData) {
          // Control has STIG findings - update compliance count
          const isCompliant = stigData.openFindings === 0;
          if (isCompliant) {
            families[family].compliantControls++;
          }
        }
      });

      // Add STIG-only controls (not in baseline)
      Array.from(stigControlData.keys())
        .filter(controlId => controlId.startsWith(family))
        .filter(controlId => !families[family].baselineControls.includes(controlId))
        .forEach(controlId => {
          const stigData = stigControlData.get(controlId);
          families[family].stigMappedControls.push({
            controlId,
            totalFindings: stigData.totalFindings,
            openFindings: stigData.openFindings,
            systemsAffected: stigData.systemsAffected.size,
            compliance: stigData.openFindings === 0 ? 'Compliant' : 'Non-Compliant',
            inBaseline: false,
          });
        });
    });

    // Calculate compliance percentages
    Object.keys(families).forEach(family => {
      const familyData = families[family];
      if (familyData.totalControls > 0) {
        familyData.compliancePercentage = Math.round(
          (familyData.compliantControls / familyData.totalControls) * 100
        );
      }
    });

    // Create control status map for frontend
    const controlStatus = new Map<string, any>();
    stigControlData.forEach((data, controlId) => {
      controlStatus.set(controlId, {
        totalFindings: data.totalFindings,
        openFindings: data.openFindings,
        systemsAffected: data.systemsAffected.size,
        catIOpen: data.catIOpen,
        catIIOpen: data.catIIOpen,
        catIIIOpen: data.catIIIOpen,
        status: data.openFindings === 0 ? 'Compliant' : 'Non-Compliant',
      });
    });

    return {
      packageId,
      families,
      controlStatus: Object.fromEntries(controlStatus),
      overallCompliance: packageScore?.overallCompliance || 0,
      assessmentCompleteness: packageScore?.assessmentCompleteness || 0,
      lastUpdated: packageScore?.calculatedAt || new Date(),
    };
  }

  /**
   * Get STIG mapped controls for a package
   */
  async getStigMappedControls(packageId: number) {
    // Get package systems for STIG data lookup
    const packageSystems = await this.prisma.system.findMany({
      where: { packageId },
      select: { id: true, name: true },
    });

    if (packageSystems.length === 0) {
      return [];
    }

    // Get all STIG findings for package systems with control mappings
    const stigFindings = await this.prisma.stigFinding.findMany({
      where: {
        systemId: { in: packageSystems.map(s => s.id) },
        controlId: { not: null },
      },
      select: {
        controlId: true,
        status: true,
        severity: true,
        systemId: true,
        cci: true,
        ruleTitle: true,
      },
    });

    // Group findings by control
    const controlFindings = new Map<string, any[]>();
    stigFindings.forEach(finding => {
      if (!finding.controlId) return;

      if (!controlFindings.has(finding.controlId)) {
        controlFindings.set(finding.controlId, []);
      }
      controlFindings.get(finding.controlId)!.push(finding);
    });

    // Get control details for each mapped control
    const controlIds = Array.from(controlFindings.keys());
    const nistControls = await this.prisma.nistControl.findMany({
      where: {
        controlId: { in: controlIds },
      },
      include: {
        ccis: true,
      },
    });

    // Build the response data
    const stigMappedControls = nistControls.map(control => {
      const findings = controlFindings.get(control.controlId) || [];
      const totalFindings = findings.length;
      const openFindings = findings.filter(f => f.status === 'Open').length;
      const catIOpen = findings.filter(f => f.status === 'Open' && f.severity === 'CAT_I').length;
      const catIIOpen = findings.filter(f => f.status === 'Open' && f.severity === 'CAT_II').length;
      const catIIIOpen = findings.filter(f => f.status === 'Open' && f.severity === 'CAT_III').length;

      // Get unique systems affected
      const systemsAffected = new Set(findings.map(f => f.systemId)).size;

      // Get unique CCIs
      const ccis = [...new Set(findings.map(f => f.cci).filter(Boolean))];

      // Determine status
      let status: 'Compliant' | 'Non-Compliant' | 'Partially Compliant';
      if (openFindings === 0) {
        status = 'Compliant';
      } else if (openFindings === totalFindings) {
        status = 'Non-Compliant';
      } else {
        status = 'Partially Compliant';
      }

      return {
        controlId: control.controlId,
        controlTitle: control.name || control.controlId,
        family: control.controlId.split('-')[0],
        totalFindings,
        openFindings,
        catIOpen,
        catIIOpen,
        catIIIOpen,
        systemsAffected,
        ccis,
        status,
      };
    });

    // Sort by family then by control ID
    return stigMappedControls.sort((a, b) => {
      if (a.family !== b.family) {
        return a.family.localeCompare(b.family);
      }
      return a.controlId.localeCompare(b.controlId);
    });
  }

  /**
   * Get package compliance summary based on baseline
   */
  async getPackageComplianceSummary(packageId: number) {
    const baseline = await this.prisma.packageControlBaseline.findMany({
      where: {
        packageId,
        includeInBaseline: true,
      },
    });

    const complianceCounts = {
      CO: 0, // Compliant Official
      CU: 0, // Compliant Unofficial
      NC_O: 0, // Non-Compliant Official
      NC_U: 0, // Non-Compliant Unofficial
      NA_O: 0, // Not Applicable Official
      NA_U: 0, // Not Applicable Unofficial
      NOT_ASSESSED: 0,
    };

    baseline.forEach(control => {
      const status = control.complianceStatus || 'NOT_ASSESSED';
      complianceCounts[status]++;
    });

    const total = baseline.length;
    const compliant = complianceCounts.CO + complianceCounts.CU;
    const nonCompliant = complianceCounts.NC_O + complianceCounts.NC_U;
    const notApplicable = complianceCounts.NA_O + complianceCounts.NA_U;
    const notAssessed = complianceCounts.NOT_ASSESSED;

    return {
      packageId,
      totalControls: total,
      compliancePercentage: total > 0 ? (compliant / total) * 100 : 0,
      breakdown: {
        compliant,
        nonCompliant,
        notApplicable,
        notAssessed,
      },
      details: complianceCounts,
    };
  }

  async getControlPackageFindings(controlId: string, packageId: number) {
    try {
      // Get the control and package info
      const control = await this.prisma.nistControl.findUnique({
        where: { controlId: controlId },
        select: { id: true, name: true }
      });

      const pkg = await this.prisma.package.findUnique({
        where: { id: packageId },
        select: { id: true, name: true }
      });

      if (!control || !pkg) {
        return null;
      }

      // Get STIG findings for this control across all systems in the package
      const stigFindings = await this.prisma.stigFinding.findMany({
        where: {
          controlId: controlId,
          system: {
            packageId: packageId
          }
        },
        include: {
          system: {
            include: {
              group: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          }
        }
      });

      // Group findings by group and system
      const groupMap = new Map<number, any>();
      let totalFindings = 0;
      let openFindings = 0;

      stigFindings.forEach(finding => {
        totalFindings++;
        if (finding.status === 'Open') {
          openFindings++;
        }

        // Skip if system doesn't have a group
        if (!finding.system.group) {
          return;
        }

        const groupId = finding.system.group.id;
        const systemId = finding.system.id;

        if (!groupMap.has(groupId)) {
          groupMap.set(groupId, {
            groupId,
            groupName: finding.system.group.name,
            totalFindings: 0,
            openFindings: 0,
            catIOpen: 0,
            catIIOpen: 0,
            catIIIOpen: 0,
            systemCount: 0,
            compliantSystems: 0,
            systems: new Map<number, any>()
          });
        }

        const group = groupMap.get(groupId);

        if (!group.systems.has(systemId)) {
          group.systems.set(systemId, {
            systemId,
            systemName: finding.system.name,
            totalFindings: 0,
            openFindings: 0,
            catIOpen: 0,
            catIIOpen: 0,
            catIIIOpen: 0,
            lastScanned: finding.system.createdAt,
            complianceScore: 0,
            status: 'Compliant'
          });
          group.systemCount++;
        }

        const system = group.systems.get(systemId);

        // Update counts
        group.totalFindings++;
        system.totalFindings++;

        if (finding.status === 'Open') {
          group.openFindings++;
          system.openFindings++;

          // Handle STIG severity mapping (matches the rest of the codebase)
          if (finding.severity === 'CAT_I') {
            group.catIOpen++;
            system.catIOpen++;
          } else if (finding.severity === 'CAT_II') {
            group.catIIOpen++;
            system.catIIOpen++;
          } else if (finding.severity === 'CAT_III') {
            group.catIIIOpen++;
            system.catIIIOpen++;
          }
        }
      });

      // Calculate compliance scores and statuses
      const groups = Array.from(groupMap.values()).map((group: any) => {
        const systems = Array.from(group.systems.values()).map((system: any) => {
          // Calculate system compliance score (percentage of closed findings)
          system.complianceScore = system.totalFindings > 0
            ? Math.round(((system.totalFindings - system.openFindings) / system.totalFindings) * 100)
            : 100;

          // Determine system status
          if (system.openFindings === 0) {
            system.status = 'Compliant';
          } else if (system.complianceScore >= 70) {
            system.status = 'Partially Compliant';
          } else {
            system.status = 'Non-Compliant';
          }

          return system;
        });

        // Count compliant systems
        group.compliantSystems = systems.filter((s: any) => s.status === 'Compliant').length;

        // Calculate group compliance score (average of system scores)
        const systemScores = systems.map((s: any) => s.complianceScore);
        group.complianceScore = systemScores.length > 0
          ? Math.round(systemScores.reduce((a, b) => a + b, 0) / systemScores.length)
          : 100;

        // Determine group status
        if (group.openFindings === 0) {
          group.status = 'Compliant';
        } else if (group.complianceScore >= 70) {
          group.status = 'Partially Compliant';
        } else {
          group.status = 'Non-Compliant';
        }

        return {
          ...group,
          systems
        };
      });

      // Calculate overall compliance
      const allSystems = groups.flatMap(g => g.systems);
      const totalSystems = allSystems.length;
      const affectedSystems = allSystems.filter((s: any) => s.totalFindings > 0).length;
      const overallCompliance = totalSystems > 0
        ? Math.round(allSystems.reduce((sum: number, s: any) => sum + s.complianceScore, 0) / totalSystems)
        : 100;

      return {
        controlId: controlId,
        controlName: control.name,
        packageId: pkg.id,
        packageName: pkg.name,
        totalFindings,
        openFindings,
        totalSystems,
        affectedSystems,
        groups,
        overallCompliance,
        lastUpdated: new Date().toISOString()
      };

    } catch (error) {
      this.logger.error(`Failed to get control package findings for ${controlId}:`, error);
      throw error;
    }
  }
}