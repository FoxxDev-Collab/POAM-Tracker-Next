import { Injectable, LoggerService } from '@nestjs/common';
import * as winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { v4 as uuidv4 } from 'uuid';

export interface SecurityEvent {
  eventType:
    | 'AUTH_SUCCESS'
    | 'AUTH_FAILURE'
    | 'ACCESS_DENIED'
    | 'DATA_ACCESS'
    | 'DATA_MODIFICATION'
    | 'SYSTEM_ERROR'
    | 'ADMIN_ACTION';
  userId?: number;
  userEmail?: string;
  ipAddress?: string;
  userAgent?: string;
  resource?: string;
  action?: string;
  details?: any;
  correlationId?: string;
}

export interface AuditEvent {
  action: string;
  resource: string;
  resourceId?: string | number;
  userId: number;
  userEmail: string;
  ipAddress?: string;
  userAgent?: string;
  oldValues?: any;
  newValues?: any;
  correlationId?: string;
}

@Injectable()
export class AppLoggerService implements LoggerService {
  private readonly logger: winston.Logger;
  private readonly auditLogger: winston.Logger;
  private readonly securityLogger: winston.Logger;

  constructor() {
    // Main application logger
    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss.SSS',
        }),
        winston.format.errors({ stack: true }),
        winston.format.json(),
        winston.format.printf(
          ({ timestamp, level, message, correlationId, ...meta }) => {
            const logEntry = {
              timestamp,
              level: level.toUpperCase(),
              message,
              correlationId: correlationId || 'N/A',
              ...meta,
            };
            return JSON.stringify(logEntry);
          },
        ),
      ),
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple(),
          ),
        }),
        new DailyRotateFile({
          filename: 'logs/application-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          maxSize: '20m',
          maxFiles: '30d',
          auditFile: 'logs/audit-application.json',
        }),
      ],
    });

    // Security events logger (for compliance)
    this.securityLogger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss.SSS',
        }),
        winston.format.json(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          const logEntry = {
            timestamp,
            level: 'SECURITY',
            message,
            classification: 'FOUO', // For Official Use Only
            ...meta,
          };
          return JSON.stringify(logEntry);
        }),
      ),
      transports: [
        new DailyRotateFile({
          filename: 'logs/security-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          maxSize: '20m',
          maxFiles: '2555d', // 7 years retention for DOD compliance
          auditFile: 'logs/audit-security.json',
        }),
      ],
    });

    // Audit trail logger (for data modifications)
    this.auditLogger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss.SSS',
        }),
        winston.format.json(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          const logEntry = {
            timestamp,
            level: 'AUDIT',
            message,
            classification: 'FOUO',
            ...meta,
          };
          return JSON.stringify(logEntry);
        }),
      ),
      transports: [
        new DailyRotateFile({
          filename: 'logs/audit-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          maxSize: '20m',
          maxFiles: '2555d', // 7 years retention
          auditFile: 'logs/audit-trail.json',
        }),
      ],
    });
  }

  generateCorrelationId(): string {
    return uuidv4();
  }

  log(message: string, context?: string, correlationId?: string) {
    this.logger.info(message, { context, correlationId });
  }

  error(
    message: string,
    trace?: string,
    context?: string,
    correlationId?: string,
  ) {
    this.logger.error(message, { trace, context, correlationId });
  }

  warn(message: string, context?: string, correlationId?: string) {
    this.logger.warn(message, { context, correlationId });
  }

  debug(message: string, context?: string, correlationId?: string) {
    this.logger.debug(message, { context, correlationId });
  }

  verbose(message: string, context?: string, correlationId?: string) {
    this.logger.verbose(message, { context, correlationId });
  }

  // Security event logging for DOD compliance
  logSecurityEvent(event: SecurityEvent) {
    const securityLog = {
      eventId: uuidv4(),
      eventType: event.eventType,
      timestamp: new Date().toISOString(),
      userId: event.userId || 'anonymous',
      userEmail: event.userEmail || 'unknown',
      ipAddress: event.ipAddress || 'unknown',
      userAgent: event.userAgent || 'unknown',
      resource: event.resource || 'unknown',
      action: event.action || 'unknown',
      details: event.details || {},
      correlationId: event.correlationId || this.generateCorrelationId(),
      severity: this.getEventSeverity(event.eventType),
    };

    this.securityLogger.info('Security Event', securityLog);

    // Also log to main logger for immediate visibility
    this.logger.warn(`SECURITY: ${event.eventType}`, {
      userId: event.userId,
      resource: event.resource,
      correlationId: securityLog.correlationId,
    });
  }

  // Audit trail logging for data modifications
  logAuditEvent(event: AuditEvent) {
    const auditLog = {
      auditId: uuidv4(),
      timestamp: new Date().toISOString(),
      action: event.action,
      resource: event.resource,
      resourceId: event.resourceId,
      userId: event.userId,
      userEmail: event.userEmail,
      ipAddress: event.ipAddress || 'unknown',
      userAgent: event.userAgent || 'unknown',
      oldValues: event.oldValues || null,
      newValues: event.newValues || null,
      correlationId: event.correlationId || this.generateCorrelationId(),
    };

    this.auditLogger.info('Data Modification', auditLog);

    // Also log to main logger
    this.logger.info(`AUDIT: ${event.action} on ${event.resource}`, {
      userId: event.userId,
      resourceId: event.resourceId,
      correlationId: auditLog.correlationId,
    });
  }

  protected getEventSeverity(
    eventType: SecurityEvent['eventType'],
  ): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    switch (eventType) {
      case 'AUTH_FAILURE':
      case 'ACCESS_DENIED':
        return 'HIGH';
      case 'SYSTEM_ERROR':
        return 'CRITICAL';
      case 'ADMIN_ACTION':
      case 'DATA_MODIFICATION':
        return 'MEDIUM';
      default:
        return 'LOW';
    }
  }
}
