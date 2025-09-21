import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import * as xml2js from 'xml2js';
import {
  NessusImportRequestDto,
  NessusReportDto,
  NessusHostDto,
  NessusVulnerabilityDto,
  StigFindingDataDto,
} from './dto';

// Interface for Nessus XML parsed data
interface NessusXmlReport {
  NessusClientData_v2?: {
    Report?: NessusXmlReportElement;
  };
  Report?: NessusXmlReportElement;
}

interface NessusXmlReportElement {
  name?: string;
  ReportHost?: NessusXmlHostElement | NessusXmlHostElement[];
}

interface NessusXmlHostElement {
  name?: string;
  HostProperties?: {
    tag?: NessusXmlTag | NessusXmlTag[];
  };
  ReportItem?: NessusXmlReportItem | NessusXmlReportItem[];
}

interface NessusXmlTag {
  name?: string;
  _?: string;
}

interface NessusXmlReportItem {
  pluginID?: string;
  pluginName?: string;
  pluginFamily?: string;
  severity?: string;
  port?: string;
  protocol?: string;
  svc_name?: string;
  description?: string;
  solution?: string;
  synopsis?: string;
  cve?: string | string[];
  cvss_base_score?: string;
  cvss3_base_score?: string;
  plugin_output?: string;
  risk_factor?: string;
  exploit_available?: string;
  patch_publication_date?: string;
  vuln_publication_date?: string;
}

interface CreatedHost {
  id: number;
  ip_address: string;
}

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
  async createFindings(
    scanId: number,
    systemId: number,
    findings: StigFindingDataDto[],
  ) {
    const findingsData = findings
      .filter((finding) => finding.ruleId || finding.rule_id) // Filter out findings without required fields
      .map((finding) => ({
        systemId,
        scanId,
        groupId: finding.groupId || finding.group_id || '',
        ruleId: finding.ruleId || finding.rule_id || '',
        ruleVersion: finding.ruleVersion || finding.rule_version || '',
        ruleTitle: finding.ruleTitle || finding.rule_title || '',
        severity: finding.severity,
        status: finding.status,
        findingDetails:
          finding.findingDetails || finding.finding_details || null,
        checkContent: finding.checkContent || finding.check_content || null,
        fixText: finding.fixText || finding.fix_text || null,
        cci: finding.cci || null,
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

    const catISeverity = findings.filter((f) => f.severity === 'CAT_I').length;
    const catIISeverity = findings.filter(
      (f) => f.severity === 'CAT_II',
    ).length;
    const catIIISeverity = findings.filter((f) => f.severity === 'CAT_III').length;

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
      catISeverity,
      catIISeverity,
      catIIISeverity,
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

  // ---
  // Nessus Vulnerability Methods
  // ---

  async importNessusData(data: NessusImportRequestDto) {
    const { report, hosts, vulnerabilities, package_id, system_id } = data;

    // Create the report
    const createdReport = await this.prisma.nessusReport.create({
      data: {
        ...report,
        packageId: package_id,
        systemId: system_id,
      },
    });

    // Create hosts with their vulnerability data
    const createdHosts = await Promise.all(
      hosts.map((host) =>
        this.prisma.nessusHost.create({
          data: {
            ...host,
            reportId: createdReport.id,
          },
        }),
      ),
    );


    // Group vulnerabilities by host IP (assuming one host in our sample)
    const vulnerabilityData = vulnerabilities.map((vuln) => ({
      ...vuln,
      reportId: createdReport.id,
      hostId: createdHosts[0].id, // For now, associate with first host
    }));

    // Batch create vulnerabilities
    await this.prisma.nessusVulnerability.createMany({
      data: vulnerabilityData,
    });

    return {
      report: createdReport,
      hostsCreated: createdHosts.length,
      vulnerabilitiesCreated: vulnerabilities.length,
    };
  }

  async findNessusReports(filters?: { packageId?: number; systemId?: number }) {
    const where: Prisma.NessusReportWhereInput = {};

    if (filters?.packageId) {
      where.packageId = filters.packageId;
    }
    if (filters?.systemId) {
      where.systemId = filters.systemId;
    }

    return this.prisma.nessusReport.findMany({
      where,
      include: {
        package: {
          select: { id: true, name: true },
        },
        system: {
          select: { id: true, name: true },
        },
        _count: {
          select: {
            hosts: true,
            vulnerabilities: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findNessusReportById(id: number) {
    return this.prisma.nessusReport.findUnique({
      where: { id },
      include: {
        package: {
          select: { id: true, name: true },
        },
        system: {
          select: { id: true, name: true },
        },
        hosts: {
          include: {
            _count: {
              select: { vulnerabilities: true },
            },
          },
        },
        vulnerabilities: {
          orderBy: [{ severity: 'desc' }, { plugin_name: 'asc' }],
          include: {
            host: {
              select: { id: true, hostname: true, ip_address: true },
            },
          },
        },
      },
    });
  }

  async deleteNessusReport(id: number) {
    return this.prisma.nessusReport.delete({
      where: { id },
    });
  }

  async findNessusVulnerabilities(filters?: {
    reportId?: number;
    hostId?: number;
    severity?: number;
    plugin_family?: string;
    limit?: number;
    offset?: number;
  }) {
    const where: Prisma.NessusVulnerabilityWhereInput = {};

    if (filters?.reportId) {
      where.reportId = filters.reportId;
    }
    if (filters?.hostId) {
      where.hostId = filters.hostId;
    }
    if (filters?.severity) {
      where.severity = { gte: filters.severity };
    }
    if (filters?.plugin_family) {
      where.plugin_family = {
        contains: filters.plugin_family,
        mode: 'insensitive',
      };
    }

    const vulnerabilities = await this.prisma.nessusVulnerability.findMany({
      where,
      include: {
        host: {
          select: {
            id: true,
            hostname: true,
            ip_address: true,
          },
        },
        report: {
          select: {
            id: true,
            scan_name: true,
            scan_date: true,
          },
        },
      },
      orderBy: [{ severity: 'desc' }, { plugin_name: 'asc' }],
      take: filters?.limit,
      skip: filters?.offset,
    });

    const totalCount = await this.prisma.nessusVulnerability.count({ where });

    return {
      vulnerabilities,
      totalCount,
      hasMore: (filters?.offset || 0) + vulnerabilities.length < totalCount,
    };
  }

  async getNessusVulnerabilityStats(filters?: {
    packageId?: number;
    systemId?: number;
    reportId?: number;
  }) {
    const where: Prisma.NessusVulnerabilityWhereInput = {};

    if (filters?.reportId) {
      where.reportId = filters.reportId;
    } else {
      // Filter by package or system if no specific report
      if (filters?.packageId || filters?.systemId) {
        where.report = {};
        if (filters.packageId) {
          where.report.packageId = filters.packageId;
        }
        if (filters.systemId) {
          where.report.systemId = filters.systemId;
        }
      }
    }

    const vulnerabilities = await this.prisma.nessusVulnerability.findMany({
      where,
      select: {
        severity: true,
        plugin_family: true,
        exploit_available: true,
      },
    });

    const stats = {
      total: vulnerabilities.length,
      critical: vulnerabilities.filter((v) => v.severity === 4).length,
      high: vulnerabilities.filter((v) => v.severity === 3).length,
      medium: vulnerabilities.filter((v) => v.severity === 2).length,
      low: vulnerabilities.filter((v) => v.severity === 1).length,
      info: vulnerabilities.filter((v) => v.severity === 0).length,
      exploitable: vulnerabilities.filter((v) => v.exploit_available).length,
    };

    // Get family breakdown
    const familyStats = vulnerabilities.reduce(
      (acc, vuln) => {
        acc[vuln.plugin_family] = (acc[vuln.plugin_family] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    return {
      ...stats,
      topFamilies: Object.entries(familyStats)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([family, count]) => ({ family, count })),
    };
  }

  async processNessusUpload(
    fileBuffer: Buffer,
    filename: string,
    packageId?: number,
    systemId?: number,
  ) {
    try {
      const fileSizeBytes = fileBuffer.length;
      const fileSizeMB = Math.round(fileSizeBytes / 1024 / 1024);

      // Memory-optimized XML parsing
      const xmlContent = fileBuffer.toString('utf-8');

      const parser = new xml2js.Parser({
        explicitArray: false,
        ignoreAttrs: false,
        mergeAttrs: true,
        normalize: false, // Disable normalization for performance
        normalizeTags: false, // Disable tag normalization for performance
        trim: true,
        async: true, // Enable async parsing for large files
      });

      const result = (await parser.parseStringPromise(
        xmlContent,
      )) as NessusXmlReport;

      // Extract report metadata
      const reportElement = result.NessusClientData_v2?.Report || result.Report;
      if (!reportElement) {
        throw new Error('Invalid Nessus file format: No Report element found');
      }

      const scan_name = reportElement?.name || filename.replace('.nessus', '');
      const scan_date = new Date().toISOString().split('T')[0];

      // Initialize counters
      let totalHosts = 0;
      let totalVulnerabilities = 0;
      const hostsData: NessusHostDto[] = [];
      const vulnerabilitiesData: NessusVulnerabilityDto[] = [];

      // Handle both single host and multiple hosts
      const reportHosts = Array.isArray(reportElement?.ReportHost)
        ? reportElement.ReportHost
        : reportElement?.ReportHost
          ? [reportElement.ReportHost]
          : [];

      for (const hostElement of reportHosts) {
        const hostname = hostElement.name || 'unknown';
        const ip_address = hostname;

        // Extract host properties
        let mac_address: string | undefined;
        let os_info: string | undefined;

        if (hostElement.HostProperties?.tag) {
          const tags = Array.isArray(hostElement.HostProperties.tag)
            ? hostElement.HostProperties.tag
            : [hostElement.HostProperties.tag];

          for (const tag of tags) {
            if (tag.name === 'mac-address') {
              mac_address = tag._ || undefined;
            } else if (tag.name === 'operating-system') {
              os_info = tag._ || undefined;
            }
          }
        }

        // Initialize host counters
        let critical_count = 0;
        let high_count = 0;
        let medium_count = 0;
        let low_count = 0;
        let info_count = 0;

        // Parse report items (vulnerabilities)
        const reportItems = Array.isArray(hostElement.ReportItem)
          ? hostElement.ReportItem
          : hostElement.ReportItem
            ? [hostElement.ReportItem]
            : [];

        for (const item of reportItems) {
          const plugin_id = parseInt(item.pluginID || '0') || 0;
          const severity = parseInt(item.severity || '0') || 0;

          // Count by severity
          switch (severity) {
            case 4:
              critical_count++;
              break;
            case 3:
              high_count++;
              break;
            case 2:
              medium_count++;
              break;
            case 1:
              low_count++;
              break;
            case 0:
              info_count++;
              break;
          }

          // Extract CVE list
          let cve_string: string | undefined;
          if (item.cve) {
            const cves: string[] = Array.isArray(item.cve)
              ? item.cve
              : [item.cve];
            cve_string = cves.join(', ');
          }

          // Parse CVSS scores
          const cvss_score = item.cvss_base_score
            ? parseFloat(item.cvss_base_score)
            : undefined;
          const cvss3_score = item.cvss3_base_score
            ? parseFloat(item.cvss3_base_score)
            : undefined;

          vulnerabilitiesData.push({
            plugin_id,
            plugin_name: item.pluginName || '',
            plugin_family: item.pluginFamily || '',
            severity,
            port: item.port || undefined,
            protocol: item.protocol || undefined,
            service: item.svc_name || undefined,
            description: item.description || undefined,
            solution: item.solution || undefined,
            synopsis: item.synopsis || undefined,
            cve: cve_string,
            cvss_score,
            cvss3_score,
            plugin_output: item.plugin_output || undefined,
            risk_factor: item.risk_factor || undefined,
            exploit_available: item.exploit_available === 'true',
            patch_publication_date: item.patch_publication_date || undefined,
            vuln_publication_date: item.vuln_publication_date || undefined,
          });
        }

        // Create host object
        hostsData.push({
          hostname,
          ip_address,
          mac_address,
          os_info,
          total_vulnerabilities: reportItems.length,
          critical_count,
          high_count,
          medium_count,
          low_count,
          info_count,
        });

        totalVulnerabilities += reportItems.length;
      }

      totalHosts = hostsData.length;

      // Create report data
      const reportData: NessusReportDto = {
        filename,
        scan_name,
        scan_date,
        total_hosts: totalHosts,
        total_vulnerabilities: totalVulnerabilities,
      };

      // Import the data with optimized batching
      const importResult = await this.importNessusDataOptimized({
        report: reportData,
        hosts: hostsData,
        vulnerabilities: vulnerabilitiesData,
        package_id: packageId,
        system_id: systemId,
      });


      return {
        success: true,
        message: `Successfully processed Nessus file: ${filename}`,
        summary: {
          filename,
          hostsProcessed: totalHosts,
          vulnerabilitiesProcessed: totalVulnerabilities,
          fileSizeMB,
          reportId: importResult.report.id,
        },
        ...importResult,
      };
    } catch (error) {
      console.error('Error processing Nessus file:', error);
      throw new Error(
        `Failed to process Nessus file: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  // Optimized import method for large datasets
  private async importNessusDataOptimized(data: NessusImportRequestDto) {
    const { report, hosts, vulnerabilities, package_id, system_id } = data;


    // Create the report
    const createdReport = await this.prisma.nessusReport.create({
      data: {
        ...report,
        packageId: package_id,
        systemId: system_id,
      },
    });


    // Batch create hosts in chunks to avoid memory issues
    const BATCH_SIZE = 100;
    const createdHosts: CreatedHost[] = [];

    for (let i = 0; i < hosts.length; i += BATCH_SIZE) {
      const batch = hosts.slice(i, i + BATCH_SIZE);
      const batchData = batch.map((host) => ({
        ...host,
        reportId: createdReport.id,
      }));


      // Use raw query for better performance with large batches
      for (const hostData of batchData) {
        const createdHost = await this.prisma.nessusHost.create({
          data: hostData,
        });
        createdHosts.push(createdHost);
      }
    }


    // Create vulnerabilities in larger batches since they're simpler
    const VULN_BATCH_SIZE = 500;
    let vulnerabilitiesCreated = 0;

    for (let i = 0; i < vulnerabilities.length; i += VULN_BATCH_SIZE) {
      const batch = vulnerabilities.slice(i, i + VULN_BATCH_SIZE);

      // Associate with first host for simplicity (could be improved with IP mapping)
      const vulnerabilityData = batch.map((vuln) => ({
        ...vuln,
        reportId: createdReport.id,
        hostId: createdHosts[0]?.id || 0, // Associate with first host
      }));


      // Use createMany for bulk insert efficiency
      await this.prisma.nessusVulnerability.createMany({
        data: vulnerabilityData,
        skipDuplicates: true, // Skip duplicates to avoid conflicts
      });

      vulnerabilitiesCreated += batch.length;
    }


    return {
      report: createdReport,
      hostsCreated: createdHosts.length,
      vulnerabilitiesCreated,
    };
  }

  // TEMPORARY: Cleanup method for testing
  async cleanupAllNessusData() {
    // Delete in correct order due to foreign key constraints
    await this.prisma.nessusVulnerability.deleteMany({});
    await this.prisma.nessusHost.deleteMany({});
    await this.prisma.nessusReport.deleteMany({});

    return { message: 'All Nessus data cleaned up successfully' };
  }
}
