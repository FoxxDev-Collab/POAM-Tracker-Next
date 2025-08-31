export interface SplunkConfig {
  url: string;
  token: string;
  index: string;
  sourcetype: string;
  source: string;
}

export interface GraylogConfig {
  host: string;
  port: number;
  facility: string;
  version: string;
}

export interface SyslogConfig {
  host: string;
  port: number;
  protocol: 'tcp' | 'udp';
  facility: number;
}

export const SIEM_FIELD_MAPPINGS = {
  // Common Event Format (CEF) mappings
  splunk: {
    timestamp: '@timestamp',
    severity: 'severity',
    eventType: 'signature',
    sourceIp: 'src',
    userId: 'suser',
    userEmail: 'suser_email',
    resource: 'request',
    action: 'act',
    correlationId: 'cs1',
    classification: 'cs2',
  },
  graylog: {
    timestamp: 'timestamp',
    severity: 'level',
    eventType: '_event_type',
    sourceIp: '_source_ip',
    userId: '_user_id',
    userEmail: '_user_email',
    resource: '_resource',
    action: '_action',
    correlationId: '_correlation_id',
    classification: '_classification',
  },
};

export const SEVERITY_MAPPINGS = {
  CRITICAL: { splunk: 'high', graylog: 2, syslog: 2 },
  HIGH: { splunk: 'medium', graylog: 3, syslog: 3 },
  MEDIUM: { splunk: 'low', graylog: 4, syslog: 4 },
  LOW: { splunk: 'informational', graylog: 6, syslog: 6 },
};
