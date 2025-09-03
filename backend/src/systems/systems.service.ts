import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { System, StigFinding, StigScan } from '@prisma/client';
import * as fs from 'fs';
import * as xml2js from 'xml2js';

export interface CreateSystemDto {
  packageId: number;
  groupId?: number;
  name: string;
  description?: string;
  ipAddress?: string;
  operatingSystem?: string;
}

export interface UpdateSystemDto {
  groupId?: number;
  name?: string;
  description?: string;
  ipAddress?: string;
  operatingSystem?: string;
}

@Injectable()
export class SystemsService {
  constructor(private prisma: PrismaService) {}

  async create(createSystemDto: CreateSystemDto): Promise<{ item: System }> {
    const system = await this.prisma.system.create({
      data: createSystemDto,
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
      data: updateSystemDto,
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
    file: any,
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
        console.log('File structure:', {
          originalname: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          hasBuffer: !!file.buffer,
          hasPath: !!file.path,
          keys: Object.keys(file),
        });
        throw new Error(
          'File buffer not available - ensure Multer is configured with memoryStorage',
        );
      }

      const fileContent = file.buffer.toString();
      let stigScan: any;
      let findings: any[] = [];

      // Try to parse as JSON first (CKLB format)
      try {
        const jsonData = JSON.parse(fileContent);

        // Handle CKLB JSON format
        if (jsonData.stigs && Array.isArray(jsonData.stigs)) {
          const stigData = jsonData.stigs[0]; // Take first STIG

          // Create scan record
          stigScan = await this.prisma.stigScan.create({
            data: {
              systemId,
              title:
                stigData.display_name ||
                stigData.stig_name ||
                jsonData.title ||
                file.originalname,
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
                console.log('JSON Rule fields:', Object.keys(rule), {
                  groupId,
                  ruleId: rule.rule_id,
                });

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
        } else {
          throw new Error('Invalid CKLB JSON format');
        }
      } catch (jsonError) {
        // If JSON parsing fails, try XML format
        try {
          const parser = new xml2js.Parser();
          const result = await parser.parseStringPromise(fileContent);

          // Extract checklist information
          const checklist = result?.CHECKLIST;
          if (!checklist) {
            throw new Error('Invalid STIG file format - not valid XML or JSON');
          }

          const asset = checklist.ASSET?.[0];
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

            console.log('STIG Data Fields:', {
              ruleId,
              groupId,
              ruleTitle,
              severity,
              status,
              availableFields: stigData
                .map((d) => d.VULN_ATTRIBUTE?.[0])
                .filter(Boolean),
            });

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
            `Invalid file format. Expected CKLB JSON or STIG XML. JSON error: ${jsonError.message}, XML error: ${xmlError.message}`,
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
