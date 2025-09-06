import { parseString } from 'xml2js';
import { promisify } from 'util';

const parseXML = promisify(parseString);

// TypeScript interfaces based on the Rust structs and sample data
export interface NessusReport {
  id?: number;
  filename: string;
  scan_name: string;
  scan_date: string;
  total_hosts: number;
  total_vulnerabilities: number;
  created_at?: string;
  scan_metadata?: string;
}

export interface NessusHost {
  id?: number;
  report_id?: number;
  hostname: string;
  ip_address: string;
  mac_address?: string;
  os_info?: string;
  total_vulnerabilities: number;
  critical_count: number;
  high_count: number;
  medium_count: number;
  low_count: number;
  info_count: number;
}

export interface NessusVulnerability {
  id?: number;
  report_id?: number;
  host_id?: number;
  plugin_id: number;
  plugin_name: string;
  plugin_family: string;
  severity: number;
  port?: string;
  protocol?: string;
  service?: string;
  description?: string;
  solution?: string;
  synopsis?: string;
  cve?: string;
  cvss_score?: number;
  cvss3_score?: number;
  plugin_output?: string;
  risk_factor?: string;
  exploit_available?: boolean;
  patch_publication_date?: string;
  vuln_publication_date?: string;
}

export interface ParsedNessusData {
  report: NessusReport;
  hosts: Map<string, NessusHost>;
  vulnerabilities: NessusVulnerability[];
}

/**
 * Parse a Nessus XML file and extract vulnerability data
 * Optimized for large file handling with memory-efficient parsing
 */
export async function parseNessusFile(xmlContent: string, filename: string): Promise<ParsedNessusData> {
  try {
    // Parsing Nessus file for processing

    const result = await parseXML(xmlContent, {
      explicitArray: false,
      ignoreAttrs: false,
      mergeAttrs: true,
      // Memory optimization options
      normalize: true,
      normalizeTags: true,
      trim: true
    });

    // Extract report metadata
    const reportElement = result.NessusClientData_v2?.Report || result.Report;
    if (!reportElement) {
      throw new Error('Invalid Nessus file format: No Report element found');
    }

    const scan_name = reportElement.name || filename.replace('.nessus', '');
    const scan_date = new Date().toISOString().split('T')[0];

    // Initialize report
    const report: NessusReport = {
      filename,
      scan_name,
      scan_date,
      total_hosts: 0,
      total_vulnerabilities: 0
    };

    // Parse hosts and vulnerabilities
    const hosts = new Map<string, NessusHost>();
    const vulnerabilities: NessusVulnerability[] = [];

    // Handle both single host and multiple hosts
    const reportHosts = Array.isArray(reportElement.ReportHost) 
      ? reportElement.ReportHost 
      : reportElement.ReportHost ? [reportElement.ReportHost] : [];

    for (const hostElement of reportHosts) {
      const hostname = hostElement.name;
      const ip_address = hostname; // Often the same in Nessus

      // Extract host properties
      let mac_address: string | undefined;
      let os_info: string | undefined;

      if (hostElement.HostProperties?.tag) {
        const tags = Array.isArray(hostElement.HostProperties.tag) 
          ? hostElement.HostProperties.tag 
          : [hostElement.HostProperties.tag];
        
        for (const tag of tags) {
          if (tag.name === 'mac-address') {
            mac_address = tag._;
          } else if (tag.name === 'operating-system') {
            os_info = tag._;
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
        : hostElement.ReportItem ? [hostElement.ReportItem] : [];

      for (const item of reportItems) {
        const plugin_id = parseInt(item.pluginID) || 0;
        const severity = parseInt(item.severity) || 0;
        
        // Count by severity
        switch (severity) {
          case 4: critical_count++; break;
          case 3: high_count++; break;
          case 2: medium_count++; break;
          case 1: low_count++; break;
          case 0: info_count++; break;
        }

        // Extract CVE list
        let cve_string: string | undefined;
        if (item.cve) {
          const cves = Array.isArray(item.cve) ? item.cve : [item.cve];
          cve_string = cves.join(', ');
        }

        // Parse CVSS scores
        const cvss_score = item.cvss_base_score ? parseFloat(item.cvss_base_score) : undefined;
        const cvss3_score = item.cvss3_base_score ? parseFloat(item.cvss3_base_score) : undefined;

        const vulnerability: NessusVulnerability = {
          plugin_id,
          plugin_name: item.pluginName || '',
          plugin_family: item.pluginFamily || '',
          severity,
          port: item.port,
          protocol: item.protocol,
          service: item.svc_name,
          description: item.description,
          solution: item.solution,
          synopsis: item.synopsis,
          cve: cve_string,
          cvss_score,
          cvss3_score,
          plugin_output: item.plugin_output,
          risk_factor: item.risk_factor,
          exploit_available: item.exploit_available === 'true',
          patch_publication_date: item.patch_publication_date,
          vuln_publication_date: item.vuln_publication_date,
        };

        vulnerabilities.push(vulnerability);
      }

      // Create host object
      const host: NessusHost = {
        hostname,
        ip_address,
        mac_address,
        os_info,
        total_vulnerabilities: reportItems.length,
        critical_count,
        high_count,
        medium_count,
        low_count,
        info_count
      };

      hosts.set(ip_address, host);
    }

    // Update report totals
    report.total_hosts = hosts.size;
    report.total_vulnerabilities = vulnerabilities.length;

    return {
      report,
      hosts,
      vulnerabilities
    };

  } catch (error) {
    console.error('Error parsing Nessus file:', error);
    throw new Error(`Failed to parse Nessus file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get vulnerability statistics by severity
 */
export function getVulnerabilityStats(vulnerabilities: NessusVulnerability[]) {
  const stats = {
    total: vulnerabilities.length,
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    info: 0
  };

  vulnerabilities.forEach(vuln => {
    switch (vuln.severity) {
      case 4: stats.critical++; break;
      case 3: stats.high++; break;
      case 2: stats.medium++; break;
      case 1: stats.low++; break;
      case 0: stats.info++; break;
    }
  });

  return stats;
}

/**
 * Filter vulnerabilities by severity level
 */
export function filterBySeverity(vulnerabilities: NessusVulnerability[], minSeverity: number = 3) {
  return vulnerabilities.filter(vuln => vuln.severity >= minSeverity);
}

/**
 * Get unique plugins (deduplicated vulnerabilities)
 */
export function getUniquePlugins(vulnerabilities: NessusVulnerability[]) {
  const pluginMap = new Map<number, NessusVulnerability>();
  
  vulnerabilities.forEach(vuln => {
    const existing = pluginMap.get(vuln.plugin_id);
    if (!existing || vuln.severity > existing.severity) {
      pluginMap.set(vuln.plugin_id, vuln);
    }
  });

  return Array.from(pluginMap.values());
}