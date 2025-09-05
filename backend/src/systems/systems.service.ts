import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { System, StigFinding } from '@prisma/client';
import * as xml2js from 'xml2js';
import { CreateSystemDto, UpdateSystemDto } from './dto';

export interface StigFile {
  originalname: string;
  buffer: Buffer;
}

export interface StigData {
  display_name?: string;
  stig_name?: string;
  stig_id?: string;
  rules?: any[];
}

export interface JsonData {
  title?: string;
  id?: string;
  stigs?: StigData[];
}

@Injectable()
export class SystemsService {
  constructor(private prisma: PrismaService) {}

  async create(createSystemDto: CreateSystemDto): Promise<{ item: System }> {
    const system = await this.prisma.system.create({
      data: {
        packageId: createSystemDto.packageId,
        groupId: createSystemDto.groupId,
        name: createSystemDto.name,
        hostname: createSystemDto.hostname,
        description: createSystemDto.description,
        ipAddress: createSystemDto.ipAddress,
        operatingSystem: createSystemDto.operatingSystem,
      },
      include: {
        package: true,
        group: true,
        _count: {
          select: {
            stigScans: true,
            stigFindings: true,
            stps: true,
          },
        },
      },
    });

    return { item: system };
  }

  async findAll(): Promise<{ items: System[] }> {
    const systems = await this.prisma.system.findMany({
      include: {
        package: true,
        group: true,
        _count: {
          select: {
            stigScans: true,
            stigFindings: true,
            stps: true,
          },
        },
      },
    });

    return { items: systems };
  }

  async findByPackage(packageId: number): Promise<{ items: System[] }> {
    const systems = await this.prisma.system.findMany({
      where: { packageId },
      include: {
        group: true,
        _count: {
          select: {
            stigScans: true,
            stigFindings: true,
            stps: true,
          },
        },
      },
    });

    return { items: systems };
  }

  async findByGroup(groupId: number): Promise<{ items: System[] }> {
    const systems = await this.prisma.system.findMany({
      where: { groupId },
      include: {
        package: true,
        group: true,
        _count: {
          select: {
            stigScans: true,
            stigFindings: true,
            stps: true,
          },
        },
      },
    });

    return { items: systems };
  }

  async findOne(id: number): Promise<System | null> {
    return this.prisma.system.findUnique({
      where: { id },
      include: {
        package: true,
        group: true,
        stigScans: true,
        stigFindings: true,
        stps: true,
      },
    });
  }

  async update(id: number, updateSystemDto: UpdateSystemDto): Promise<System> {
    return this.prisma.system.update({
      where: { id },
      data: {
        name: updateSystemDto.name,
        hostname: updateSystemDto.hostname,
        description: updateSystemDto.description,
        ipAddress: updateSystemDto.ipAddress,
        operatingSystem: updateSystemDto.operatingSystem,
      },
    });
  }

  async remove(id: number): Promise<System> {
    return this.prisma.system.delete({
      where: { id },
    });
  }

  // STIG-related methods
  async getStigFindings(systemId: number): Promise<{ items: StigFinding[] }> {
    const findings = await this.prisma.stigFinding.findMany({
      where: { systemId },
      orderBy: [{ severity: 'asc' }, { status: 'asc' }, { ruleId: 'asc' }],
    });

    return { items: findings };
  }

  async getStigScans(systemId: number): Promise<{ items: any[] }> {
    const scans = await this.prisma.stigScan.findMany({
      where: { systemId },
      orderBy: { createdAt: 'desc' },
    });

    return { items: scans };
  }

  async uploadStigFile(
    systemId: number,
    file: StigFile,
  ): Promise<{ success: boolean; message: string; scanId?: number }> {
    try {
      // Verify system exists
      const system = await this.prisma.system.findUnique({
        where: { id: systemId },
      });

      if (!system) {
        throw new Error('System not found');
      }

      if (!file) {
        throw new Error('No file provided');
      }

      if (!file.buffer) {
        throw new Error('File buffer is missing');
      }

      const fileContent = file.buffer.toString('utf-8');
      const findings: any[] = [];
      let stigScan: any;

      // Try parsing as JSON first (CKLB format). If this fails or content is invalid, fallback to XML parsing.
      let parsedAsJson = false;
      try {
        const jsonData = JSON.parse(fileContent) as JsonData;
        if (
          jsonData.stigs &&
          Array.isArray(jsonData.stigs) &&
          jsonData.stigs.length > 0
        ) {
          const stigData = jsonData.stigs[0]; // Take first STIG

          // Create scan record
          stigScan = await this.prisma.stigScan.create({
            data: {
              systemId,
              title:
                (stigData.display_name ||
                  stigData.stig_name ||
                  jsonData.title ||
                  file.originalname) ??
                'Untitled Scan',
              checklistId: stigData.stig_id || jsonData.id || null,
              createdAt: new Date(),
            },
          });

          // Process rules/findings
          if (stigData.rules && Array.isArray(stigData.rules)) {
            for (const rule of stigData.rules) {
              if (rule.rule_id) {
                const groupId =
                  rule.group_id ||
                  rule.groupId ||
                  rule.vuln_num ||
                  rule.rule_id?.split('-')[0];

                findings.push({
                  systemId,
                  scanId: stigScan.id,
                  groupId: groupId || null,
                  ruleId: rule.rule_id,
                  ruleTitle: rule.rule_title || rule.rule_id,
                  severity: this.normalizeSeverity(rule.severity || ''),
                  status: this.normalizeStatus(rule.status || 'Not_Reviewed'),
                  findingDetails: rule.comments || rule.finding_details || null,
                  lastSeen: new Date(),
                });
              }
            }
          }

          parsedAsJson = true;
        }
      } catch {
        // Ignore here; we'll attempt XML next
      }

      if (!parsedAsJson) {
        // Try XML parse fallback
        try {
          const parser = new xml2js.Parser();
          const result = await parser.parseStringPromise(fileContent);

          const checklist = result?.CHECKLIST;
          if (!checklist) {
            throw new Error('Invalid STIG file format - not valid XML or JSON');
          }

          const stig = checklist.STIGS?.[0]?.iSTIG?.[0];
          if (!stig) {
            throw new Error('No STIG data found in XML file');
          }

          const stigInfo = stig.STIG_INFO;
          const vulns = stig.VULN || [];

          // Create a new STIG scan record
          stigScan = await this.prisma.stigScan.create({
            data: {
              systemId,
              title:
                this.extractStigInfo(stigInfo, 'title') || file.originalname,
              checklistId:
                this.extractStigInfo(stigInfo, 'stigid') ||
                this.extractStigInfo(stigInfo, 'version'),
              createdAt: new Date(),
            },
          });

          // Process vulnerabilities/findings
          for (const vuln of vulns) {
            const stigData = vuln.STIG_DATA || [];
            const ruleId =
              this.extractVulnAttribute(stigData, 'Rule_ID') ||
              this.extractVulnAttribute(stigData, 'Vuln_Num');
            const groupId =
              this.extractVulnAttribute(stigData, 'Group_Title') ||
              this.extractVulnAttribute(stigData, 'Vuln_Num') ||
              this.extractVulnAttribute(stigData, 'Group_ID');
            const ruleTitle = this.extractVulnAttribute(stigData, 'Rule_Title');
            const severity = this.extractVulnAttribute(stigData, 'Severity');
            const status = vuln.STATUS?.[0] || 'Not_Reviewed';
            const comments = vuln.FINDING_DETAILS?.[0] || '';

            if (ruleId) {
              findings.push({
                systemId,
                scanId: stigScan.id,
                groupId: groupId || null,
                ruleId,
                ruleTitle: ruleTitle || ruleId,
                severity: this.normalizeSeverity(severity || ''),
                status: this.normalizeStatus(status),
                findingDetails: comments || null,
                lastSeen: new Date(),
              });
            }
          }
        } catch (xmlError) {
          throw new Error(
            `Invalid file format. Expected CKLB JSON or STIG XML. XML error: ${xmlError.message}`,
          );
        }
      }

      console.log('Processed findings count:', findings.length);
      console.log('Sample finding:', findings[0]);

      // Batch insert findings
      if (findings.length > 0) {
        try {
          const result = await this.prisma.stigFinding.createMany({
            data: findings,
            skipDuplicates: true,
          });
          console.log('Database insert result:', result);
        } catch (insertError) {
          console.error('Database insert failed:', insertError);
          throw new Error(`Database insert failed: ${insertError.message}`);
        }
      } else {
        console.warn('No findings to insert - findings array is empty');
      }

      return {
        success: true,
        message: `Successfully imported ${findings.length} STIG findings`,
        scanId: stigScan.id,
      };
    } catch (error) {
      console.error('Error processing STIG file:', error);
      return {
        success: false,
        message: `Failed to process STIG file: ${error.message}`,
      };
    }
  }

  private extractStigInfo(stigInfo: any[], attribute: string): string | null {
    if (!Array.isArray(stigInfo)) return null;

    for (const info of stigInfo) {
      const siData = info.SI_DATA;
      if (Array.isArray(siData)) {
        for (const data of siData) {
          if (
            data.SID_NAME?.[0]?.toLowerCase().includes(attribute.toLowerCase())
          ) {
            return data.SID_DATA?.[0] || null;
          }
        }
      }
    }
    return null;
  }

  private extractVulnAttribute(
    stigData: any[],
    attribute: string,
  ): string | null {
    if (!Array.isArray(stigData)) return null;

    for (const data of stigData) {
      if (data.VULN_ATTRIBUTE?.[0] === attribute) {
        return data.ATTRIBUTE_DATA?.[0] || null;
      }
    }
    return null;
  }

  private normalizeSeverity(severity: string): string {
    if (!severity) return 'unknown';
    const lower = severity.toLowerCase();
    if (
      lower.includes('high') ||
      (lower.includes('cat') && lower.includes('i'))
    )
      return 'high';
    if (
      lower.includes('medium') ||
      (lower.includes('cat') && lower.includes('ii'))
    )
      return 'medium';
    if (
      lower.includes('low') ||
      (lower.includes('cat') && lower.includes('iii'))
    )
      return 'low';
    return severity;
  }

  private normalizeStatus(status: string): string {
    if (!status) return 'Not_Reviewed';
    const lower = status.toLowerCase().replace(/[\s-]/g, '_');

    // Handle various "Not a Finding" formats
    if (
      (lower.includes('not') && lower.includes('finding')) ||
      lower === 'notafinding' ||
      lower === 'not_a_finding'
    ) {
      return 'NotAFinding';
    }

    // Handle "Not Applicable" formats
    if (
      (lower.includes('not') && lower.includes('applicable')) ||
      lower === 'not_applicable' ||
      lower === 'na'
    ) {
      return 'Not_Applicable';
    }

    // Handle "Not Reviewed" formats
    if (
      (lower.includes('not') && lower.includes('reviewed')) ||
      lower === 'not_reviewed' ||
      lower === 'nr'
    ) {
      return 'Not_Reviewed';
    }

    // Handle "Open" formats
    if (lower === 'open' || lower === 'finding') {
      return 'Open';
    }

    return status;
  }
}
