import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { parseStringPromise } from 'xml2js';
import { CciMapperService, StigFindingWithControl } from './cci-mapper.service';
import { ControlComplianceService } from './control-compliance.service';

export interface StigImportResult {
  scanId: number;
  totalFindings: number;
  mappedControls: number;
  openFindings: number;
  notReviewedFindings: number;
}

export interface SystemScore {
  assessmentProgress: number;
  complianceScore: number;
  totalFindings: number;
  openFindings: number;
  notReviewedFindings: number;
  catIOpen: number;
  catIIOpen: number;
  catIIIOpen: number;
}

@Injectable()
export class StigImportService {
  private readonly logger = new Logger(StigImportService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cciMapper: CciMapperService,
    private readonly controlCompliance: ControlComplianceService,
  ) {}

  async parseStigScan(fileContent: string, filename: string): Promise<StigFindingWithControl[]> {
    try {
      const findings: StigFindingWithControl[] = [];
      const fileExtension = filename.toLowerCase().split('.').pop();

      if (fileExtension === 'cklb') {
        // JSON format (.cklb)
        const parsed = JSON.parse(fileContent);
        findings.push(...this.parseCklbFormat(parsed));
      } else {
        // XML format (.ckl)
        const parsed = await parseStringPromise(fileContent);

        // Handle different STIG file formats (XCCDF, CKL, etc.)
        if (parsed.Benchmark) {
          // XCCDF format
          findings.push(...this.parseXccdfFormat(parsed));
        } else if (parsed.CHECKLIST) {
          // CKL format
          findings.push(...this.parseCklFormat(parsed));
        } else {
          throw new Error('Unsupported STIG file format');
        }
      }

      return findings;
    } catch (error) {
      this.logger.error('Error parsing STIG scan:', error);
      throw new Error(`Failed to parse STIG scan: ${error.message}`);
    }
  }

  private parseXccdfFormat(parsed: any): StigFindingWithControl[] {
    const findings: StigFindingWithControl[] = [];
    const testResults = parsed.Benchmark?.TestResult?.[0];

    if (!testResults) return findings;

    const ruleResults = testResults['rule-result'] || [];

    for (const result of ruleResults) {
      const ruleId = result.$.idref;
      const status = result.result?.[0];

      // Find corresponding rule details
      const rule = this.findRuleInBenchmark(parsed.Benchmark, ruleId);

      if (rule) {
        const finding = this.cciMapper.parseStigFinding({
          rule_id: ruleId,
          vuln_id: rule.vulnId,
          title: rule.title,
          severity: rule.severity,
          status: status,
          cci_ref: rule.cci,
          vuln_discuss: rule.description,
          check_content: rule.checkContent,
          fix_text: rule.fixText,
        });

        findings.push(finding);
      }
    }

    return findings;
  }

  private parseCklFormat(parsed: any): StigFindingWithControl[] {
    const findings: StigFindingWithControl[] = [];
    const vulns = parsed.CHECKLIST?.STIGS?.[0]?.iSTIG?.[0]?.VULN || [];

    for (const vuln of vulns) {
      const stigData = vuln.STIG_DATA || [];

      const finding = this.cciMapper.parseStigFinding({
        rule_id: this.getStigDataValue(stigData, 'Rule_ID'),
        vuln_id: this.getStigDataValue(stigData, 'Vuln_Num'),
        title: this.getStigDataValue(stigData, 'Rule_Title'),
        severity: this.getStigDataValue(stigData, 'Severity'),
        status: vuln.STATUS?.[0] || 'Not_Reviewed',
        cci_ref: this.getStigDataValue(stigData, 'CCI_REF'),
        vuln_discuss: this.getStigDataValue(stigData, 'Vuln_Discuss'),
        check_content: this.getStigDataValue(stigData, 'Check_Content'),
        fix_text: this.getStigDataValue(stigData, 'Fix_Text'),
      });

      findings.push(finding);
    }

    return findings;
  }

  private getStigDataValue(stigData: any[], attributeName: string): string {
    const item = stigData.find(d => d.VULN_ATTRIBUTE?.[0] === attributeName);
    return item?.ATTRIBUTE_DATA?.[0] || '';
  }

  private findRuleInBenchmark(benchmark: any, ruleId: string): any {
    // Search through benchmark groups for the rule
    const groups = benchmark.Group || [];

    for (const group of groups) {
      const rules = group.Rule || [];
      const rule = rules.find((r: any) => r.$.id === ruleId);

      if (rule) {
        return {
          vulnId: rule.ident?.[0]?._,
          title: rule.title?.[0],
          severity: rule.$.severity,
          description: rule.description?.[0],
          cci: rule.ident?.find((i: any) => i.$.system?.includes('cci'))?._,
          checkContent: rule.check?.[0]?.['check-content']?.[0],
          fixText: rule.fixtext?.[0]?._,
        };
      }

      // Recursively search subgroups
      if (group.Group) {
        const subResult = this.findRuleInBenchmark({ Group: group.Group }, ruleId);
        if (subResult) return subResult;
      }
    }

    return null;
  }

  async createStigScan(
    systemId: number,
    filename: string,
    importedBy: number,
    findingCount: number,
  ): Promise<number> {
    const scan = await this.prisma.stigScan.create({
      data: {
        systemId,
        filename,
        importedBy,
        findingCount,
      },
    });

    return scan.id;
  }

  async saveStigFindings(
    scanId: number,
    systemId: number,
    findings: StigFindingWithControl[],
  ): Promise<void> {
    for (const finding of findings) {
      // Check for previous STP completion
      const previousFinding = await this.prisma.stigFinding.findFirst({
        where: {
          systemId,
          ruleId: finding.ruleId,
          stpStatus: 'Passed',
        },
        orderBy: {
          id: 'desc',
        },
      });

      const findingData = {
        scanId,
        systemId,
        ruleId: finding.ruleId,
        vulnId: finding.vulnId,
        ruleTitle: finding.title,
        severity: finding.severity,
        status: previousFinding?.stpStatus === 'Passed' ? 'Not_a_Finding' : finding.status,
        controlId: finding.controlId,
        stpStatus: previousFinding?.stpStatus || 'None',
        lastStpId: previousFinding?.lastStpId || null,
        findingDetails: finding.description || null,
        checkContent: finding.checkContent || null,
        fixText: finding.fixText || null,
        cci: finding.cci || null,
      };

      await this.prisma.stigFinding.upsert({
        where: {
          systemId_ruleId: {
            systemId,
            ruleId: finding.ruleId,
          },
        },
        update: {
          scanId,
          vulnId: finding.vulnId,
          ruleTitle: finding.title,
          severity: finding.severity,
          status: previousFinding?.stpStatus === 'Passed' ? 'Not_a_Finding' : finding.status,
          controlId: finding.controlId,
          findingDetails: finding.description || null,
          checkContent: finding.checkContent || null,
          fixText: finding.fixText || null,
          cci: finding.cci || null,
          // Don't update stpStatus and lastStpId if they already exist
        },
        create: findingData,
      });
    }
  }

  async calculateSystemScore(systemId: number, scanId: number): Promise<SystemScore> {
    const findings = await this.prisma.stigFinding.findMany({
      where: { scanId, systemId },
    });

    const totalFindings = findings.length;
    const notReviewedFindings = findings.filter(f => f.status === 'Not_Reviewed').length;
    const openFindings = findings.filter(f => f.status === 'Open').length;
    const compliantFindings = findings.filter(
      f => f.status === 'Not_a_Finding' || f.status === 'Not_Applicable',
    ).length;

    const catIOpen = findings.filter(f => f.status === 'Open' && f.severity === 'CAT_I').length;
    const catIIOpen = findings.filter(f => f.status === 'Open' && f.severity === 'CAT_II').length;
    const catIIIOpen = findings.filter(f => f.status === 'Open' && f.severity === 'CAT_III').length;

    const reviewedFindings = totalFindings - notReviewedFindings;
    const assessmentProgress = totalFindings > 0 ? (reviewedFindings / totalFindings) * 100 : 0;
    const complianceScore = reviewedFindings > 0 ? (compliantFindings / reviewedFindings) * 100 : 0;

    // Save score to database
    await this.prisma.systemScore.upsert({
      where: {
        systemId_scanId: {
          systemId,
          scanId,
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
      },
      create: {
        systemId,
        scanId,
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

    return {
      assessmentProgress,
      complianceScore,
      totalFindings,
      openFindings,
      notReviewedFindings,
      catIOpen,
      catIIOpen,
      catIIIOpen,
    };
  }

  async updateControlSystemStatus(systemId: number, scanId: number): Promise<void> {
    // Get all findings mapped to controls
    const findings = await this.prisma.stigFinding.findMany({
      where: {
        scanId,
        systemId,
        controlId: { not: null },
      },
    });

    // Group findings by control
    const controlFindings = new Map<string, any[]>();
    for (const finding of findings) {
      if (finding.controlId) {
        if (!controlFindings.has(finding.controlId)) {
          controlFindings.set(finding.controlId, []);
        }
        controlFindings.get(finding.controlId)!.push(finding);
      }
    }

    // Update control status for each control
    for (const [controlId, controlFindingList] of Array.from(controlFindings.entries())) {
      const openCount = controlFindingList.filter(f => f.status === 'Open').length;
      const criticalCount = controlFindingList.filter(
        f => f.status === 'Open' && f.severity === 'CAT_I',
      ).length;

      await this.prisma.controlSystemStatus.upsert({
        where: {
          controlId_systemId: {
            controlId,
            systemId,
          },
        },
        update: {
          hasFindings: controlFindingList.length > 0,
          openCount,
          criticalCount,
          lastAssessed: new Date(),
        },
        create: {
          controlId,
          systemId,
          hasFindings: controlFindingList.length > 0,
          openCount,
          criticalCount,
          lastAssessed: new Date(),
        },
      });
    }

    // Update NIST control compliance status based on STIG findings
    try {
      await this.controlCompliance.updateComplianceAfterStigImport(systemId, scanId);
      this.logger.log(`Updated NIST control compliance for ${controlFindings.size} controls`);
    } catch (error) {
      this.logger.error('Failed to update NIST control compliance:', error);
      // Don't fail the entire import if compliance update fails
    }
  }

  private parseCklbFormat(parsed: any): StigFindingWithControl[] {
    const findings: StigFindingWithControl[] = [];

    if (!parsed.stigs || !Array.isArray(parsed.stigs)) {
      throw new Error("Invalid CKLB format: missing stigs array");
    }

    for (const stig of parsed.stigs) {
      if (!stig.rules || !Array.isArray(stig.rules)) {
        continue;
      }

      for (const rule of stig.rules) {
        const finding: StigFindingWithControl = {
          ruleId: rule.rule_id_src || rule.group_id || "",
          vulnId: rule.group_id || "",
          title: rule.rule_title || "",
          severity: this.mapSeverity(rule.severity),
          status: this.mapStatus(rule.status),
          description: rule.discussion || "",
          checkContent: rule.check_content || "",
          fixText: rule.fix_text || "",
          cci: rule.ccis && Array.isArray(rule.ccis) && rule.ccis.length > 0 ? rule.ccis[0] : undefined,
          controlId: undefined,
        };

        // Map CCI controls if available
        if (rule.ccis && Array.isArray(rule.ccis)) {
          for (const cci of rule.ccis) {
            const controlId = this.cciMapper.mapCciToControl(cci);
            if (controlId) {
              finding.controlId = controlId;
              break; // Use first mapped control
            }
          }
        }

        findings.push(finding);
      }
    }

    return findings;
  }

  private mapSeverity(severity: string): string {
    if (!severity) return "CAT_III";
    
    const severityMap = {
      "high": "CAT_I",
      "medium": "CAT_II",
      "low": "CAT_III",
      "CAT_I": "CAT_I",
      "CAT_II": "CAT_II",
      "CAT_III": "CAT_III"
    };
    
    return severityMap[severity.toLowerCase()] || "CAT_III";
  }

  private mapStatus(status: string): string {
    if (!status) return "Not_Reviewed";
    
    const statusMap = {
      "open": "Open",
      "notafinding": "Not_a_Finding",
      "not_applicable": "Not_Applicable",
      "not_reviewed": "Not_Reviewed"
    };
    
    return statusMap[status.toLowerCase()] || "Not_Reviewed";
  }
}
