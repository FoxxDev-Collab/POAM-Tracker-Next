import { Injectable } from '@nestjs/common';
import * as winston from 'winston';
import * as SplunkLogger from 'winston-splunk-httplogger';
import * as gelf from 'gelf';
import { AppLoggerService, SecurityEvent, AuditEvent } from './logger.service';

export interface SiemConfig {
  splunk?: {
    enabled: boolean;
    url: string;
    token: string;
    index?: string;
    sourcetype?: string;
  };
  graylog?: {
    enabled: boolean;
    host: string;
    port: number;
    facility?: string;
  };
  syslog?: {
    enabled: boolean;
    host: string;
    port: number;
    protocol?: 'tcp' | 'udp';
  };
}

@Injectable()
export class SiemLoggerService extends AppLoggerService {
  private splunkLogger?: winston.Logger;
  private graylogClient?: any;
  private siemConfig: SiemConfig;

  constructor() {
    super();
    this.siemConfig = this.loadSiemConfig();
    this.initializeSiemTransports();
  }

  private loadSiemConfig(): SiemConfig {
    return {
      splunk: {
        enabled: process.env.SPLUNK_ENABLED === 'true',
        url: process.env.SPLUNK_URL || '',
        token: process.env.SPLUNK_TOKEN || '',
        index: process.env.SPLUNK_INDEX || 'poam_tracker',
        sourcetype: process.env.SPLUNK_SOURCETYPE || 'json_auto',
      },
      graylog: {
        enabled: process.env.GRAYLOG_ENABLED === 'true',
        host: process.env.GRAYLOG_HOST || 'localhost',
        port: parseInt(process.env.GRAYLOG_PORT || '12201'),
        facility: process.env.GRAYLOG_FACILITY || 'poam-tracker',
      },
      syslog: {
        enabled: process.env.SYSLOG_ENABLED === 'true',
        host: process.env.SYSLOG_HOST || 'localhost',
        port: parseInt(process.env.SYSLOG_PORT || '514'),
        protocol: (process.env.SYSLOG_PROTOCOL as 'tcp' | 'udp') || 'udp',
      },
    };
  }

  private initializeSiemTransports() {
    // Initialize Splunk logger
    if (
      this.siemConfig.splunk?.enabled &&
      this.siemConfig.splunk.url &&
      this.siemConfig.splunk.token
    ) {
      this.splunkLogger = winston.createLogger({
        transports: [
          new SplunkLogger({
            url: this.siemConfig.splunk.url,
            token: this.siemConfig.splunk.token,
            index: this.siemConfig.splunk.index,
            sourcetype: this.siemConfig.splunk.sourcetype,
          }),
        ],
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json(),
          winston.format.printf(({ timestamp, level, message, ...meta }) => {
            return JSON.stringify({
              time: timestamp,
              level,
              message,
              source: 'poam-tracker-backend',
              host: process.env.HOSTNAME || 'unknown',
              ...meta,
            });
          }),
        ),
      });
    }

    // Initialize Graylog client
    if (this.siemConfig.graylog?.enabled) {
      this.graylogClient = new gelf.gelf({
        graylogHostname: this.siemConfig.graylog.host,
        graylogPort: this.siemConfig.graylog.port,
        connection: 'wan',
        maxChunkSizeWan: 1420,
        maxChunkSizeLan: 8154,
        facility: this.siemConfig.graylog.facility,
      });
    }
  }

  // Enhanced security event logging for SIEM
  logSecurityEvent(event: SecurityEvent) {
    // Call parent method for file logging
    super.logSecurityEvent(event);

    const siemEvent = this.formatSecurityEventForSiem(event);

    // Send to Splunk
    if (this.splunkLogger) {
      this.splunkLogger.info('Security Event', siemEvent);
    }

    // Send to Graylog
    if (this.graylogClient) {
      this.graylogClient.emit('gelf.log', {
        version: '1.1',
        host: process.env.HOSTNAME || 'poam-tracker-backend',
        short_message: `Security Event: ${event.eventType}`,
        full_message: JSON.stringify(siemEvent),
        timestamp: Date.now() / 1000,
        level: this.mapSeverityToSyslogLevel(siemEvent.severity),
        facility: this.siemConfig.graylog?.facility,
        ...this.flattenForGraylog(siemEvent),
      });
    }
  }

  // Enhanced audit event logging for SIEM
  logAuditEvent(event: AuditEvent) {
    // Call parent method for file logging
    super.logAuditEvent(event);

    const siemEvent = this.formatAuditEventForSiem(event);

    // Send to Splunk
    if (this.splunkLogger) {
      this.splunkLogger.info('Audit Event', siemEvent);
    }

    // Send to Graylog
    if (this.graylogClient) {
      this.graylogClient.emit('gelf.log', {
        version: '1.1',
        host: process.env.HOSTNAME || 'poam-tracker-backend',
        short_message: `Audit: ${event.action} on ${event.resource}`,
        full_message: JSON.stringify(siemEvent),
        timestamp: Date.now() / 1000,
        level: 6, // Info level
        facility: this.siemConfig.graylog?.facility,
        ...this.flattenForGraylog(siemEvent),
      });
    }
  }

  private formatSecurityEventForSiem(event: SecurityEvent) {
    return {
      // Common Event Format (CEF) inspired fields
      event_type: 'security',
      event_category: 'authentication',
      event_action: event.eventType,
      event_outcome: event.eventType.includes('SUCCESS')
        ? 'success'
        : 'failure',

      // Temporal fields
      '@timestamp': new Date().toISOString(),
      event_time: new Date().toISOString(),

      // Source fields
      source_ip: event.ipAddress || 'unknown',
      source_user_agent: event.userAgent || 'unknown',

      // User fields
      user_id: event.userId || null,
      user_email: event.userEmail || 'unknown',

      // Resource fields
      resource_name: event.resource || 'unknown',
      resource_action: event.action || 'unknown',

      // Correlation
      correlation_id: event.correlationId,

      // Security specific
      security_event_type: event.eventType,
      severity: this.getEventSeverity(event.eventType),
      classification: 'FOUO',

      // Application context
      application: 'poam-tracker',
      environment: process.env.NODE_ENV || 'development',
      version: process.env.APP_VERSION || '1.0.0',

      // Additional details
      details: event.details || {},

      // Compliance tags
      tags: ['security', 'dod-compliance', 'audit-trail'],
    };
  }

  private formatAuditEventForSiem(event: AuditEvent) {
    return {
      // Event classification
      event_type: 'audit',
      event_category: 'data_modification',
      event_action: event.action,
      event_outcome: 'success',

      // Temporal fields
      '@timestamp': new Date().toISOString(),
      event_time: new Date().toISOString(),

      // Source fields
      source_ip: event.ipAddress || 'unknown',
      source_user_agent: event.userAgent || 'unknown',

      // User fields
      user_id: event.userId,
      user_email: event.userEmail,

      // Resource fields
      resource_type: event.resource,
      resource_id: event.resourceId,
      resource_action: event.action,

      // Data change tracking
      data_before: event.oldValues ? JSON.stringify(event.oldValues) : null,
      data_after: event.newValues ? JSON.stringify(event.newValues) : null,

      // Correlation
      correlation_id: event.correlationId,

      // Application context
      application: 'poam-tracker',
      environment: process.env.NODE_ENV || 'development',
      version: process.env.APP_VERSION || '1.0.0',

      // Compliance fields
      classification: 'FOUO',
      retention_period: '7_years',

      // Tags for filtering
      tags: ['audit', 'data-modification', 'dod-compliance'],
    };
  }

  private flattenForGraylog(obj: Record<string, unknown>, prefix = ''): Record<string, unknown> {
    const flattened: Record<string, unknown> = {};

    for (const key in obj) {
      if (
        obj[key] !== null &&
        typeof obj[key] === 'object' &&
        !Array.isArray(obj[key])
      ) {
        Object.assign(
          flattened,
          this.flattenForGraylog(obj[key] as Record<string, unknown>, `${prefix}${key}_`),
        );
      } else {
        flattened[`${prefix}${key}`] = obj[key];
      }
    }

    return flattened;
  }

  private mapSeverityToSyslogLevel(severity: string): number {
    switch (severity) {
      case 'CRITICAL':
        return 2; // Critical
      case 'HIGH':
        return 3; // Error
      case 'MEDIUM':
        return 4; // Warning
      case 'LOW':
        return 6; // Info
      default:
        return 6; // Info
    }
  }

  // Method to test SIEM connectivity
  async testSiemConnectivity(): Promise<{ splunk: boolean; graylog: boolean }> {
    const results = { splunk: false, graylog: false };

    // Test Splunk
    if (this.splunkLogger) {
      try {
        this.splunkLogger.info('SIEM Connectivity Test', {
          test: true,
          timestamp: new Date().toISOString(),
          source: 'connectivity-test',
        });
        results.splunk = true;
      } catch (error) {
        this.error(
          'Splunk connectivity test failed',
          error.stack,
          'SiemLogger',
        );
      }
    }

    // Test Graylog
    if (this.graylogClient) {
      try {
        this.graylogClient.emit('gelf.log', {
          version: '1.1',
          host: process.env.HOSTNAME || 'poam-tracker-backend',
          short_message: 'SIEM Connectivity Test',
          full_message: 'Testing Graylog connectivity',
          timestamp: Date.now() / 1000,
          level: 6,
          facility: this.siemConfig.graylog?.facility,
          test: true,
        });
        results.graylog = true;
      } catch (error) {
        this.error(
          'Graylog connectivity test failed',
          error.stack,
          'SiemLogger',
        );
      }
    }

    return results;
  }
}
