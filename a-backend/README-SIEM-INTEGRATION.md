# SIEM Integration Guide: Splunk & Graylog

## Overview
This guide covers integrating the POAM Tracker backend logging system with Splunk Enterprise Security and Graylog for centralized security monitoring and compliance reporting.

## Quick Setup

### Environment Variables
Add these to your `.env` file:

```bash
# Splunk Integration
SPLUNK_ENABLED=true
SPLUNK_URL=https://your-splunk-server:8088/services/collector
SPLUNK_TOKEN=your-hec-token-here
SPLUNK_INDEX=poam_tracker
SPLUNK_SOURCETYPE=json_auto

# Graylog Integration  
GRAYLOG_ENABLED=true
GRAYLOG_HOST=your-graylog-server
GRAYLOG_PORT=12201
GRAYLOG_FACILITY=poam-tracker

# Syslog (Alternative)
SYSLOG_ENABLED=false
SYSLOG_HOST=your-syslog-server
SYSLOG_PORT=514
SYSLOG_PROTOCOL=udp

# Application Context
HOSTNAME=poam-tracker-backend-01
APP_VERSION=1.0.0
```

### Update Logger Module
Replace `AppLoggerService` with `SiemLoggerService` in your modules:

```typescript
// In logging.module.ts
import { SiemLoggerService } from './siem-logger.service';

@Global()
@Module({
  providers: [SiemLoggerService],
  exports: [SiemLoggerService],
})
export class LoggerModule {}
```

## Splunk Integration

### 1. HTTP Event Collector (HEC) Setup

#### Enable HEC in Splunk
```bash
# Via Splunk Web UI:
Settings > Data Inputs > HTTP Event Collector > New Token

# Or via CLI:
splunk http-event-collector enable
splunk http-event-collector create poam-tracker-token -uri https://localhost:8089
```

#### Create Indexes
```bash
# Security events (7-year retention)
splunk add index security -maxDataSize auto -maxHotBuckets 10 -maxWarmDBCount 300

# Audit events (7-year retention)  
splunk add index audit -maxDataSize auto -maxHotBuckets 10 -maxWarmDBCount 300

# Application logs (30-day retention)
splunk add index application -maxDataSize auto -maxHotBuckets 3 -maxWarmDBCount 10
```

### 2. Universal Forwarder Setup

#### Install Universal Forwarder
```bash
# Download and install Splunk Universal Forwarder
wget -O splunkforwarder.tgz "https://download.splunk.com/..."
tar -xzf splunkforwarder.tgz -C /opt/
/opt/splunkforwarder/bin/splunk start --accept-license
```

#### Configure Inputs
```bash
# Copy provided configuration
cp config/splunk/inputs.conf /opt/splunkforwarder/etc/apps/poam_tracker/local/
cp config/splunk/props.conf /opt/splunkforwarder/etc/apps/poam_tracker/local/

# Update paths in inputs.conf to match your deployment
sed -i 's|/path/to/poam-tracker|/actual/path/to/poam-tracker|g' \
  /opt/splunkforwarder/etc/apps/poam_tracker/local/inputs.conf

# Restart forwarder
/opt/splunkforwarder/bin/splunk restart
```

### 3. Splunk Searches & Dashboards

#### Security Event Monitoring
```spl
# Failed authentication attempts
index=security eventType=AUTH_FAILURE 
| stats count by userEmail, ipAddress 
| where count > 5

# Privilege escalation attempts
index=audit action=UPDATE resource=USER oldValues="*role*" newValues="*Admin*"
| table _time, userEmail, ipAddress, resourceId

# Suspicious IP activity
index=security OR index=audit 
| stats dc(userEmail) as unique_users, count by ipAddress 
| where unique_users > 10 OR count > 100
```

#### Compliance Reporting
```spl
# Data access audit trail
index=audit resource=PACKAGE OR resource=SYSTEM OR resource=GROUP
| eval data_classification="FOUO"
| table _time, userEmail, action, resource, resourceId, ipAddress
| outputcsv audit_report.csv

# 7-year retention verification
| rest /services/data/indexes 
| where title IN ("security", "audit")
| eval retention_days=round(maxDataSize/1024/1024/365,0)
| table title, retention_days, currentDBSizeMB
```

## Graylog Integration

### 1. Graylog Server Setup

#### Configure GELF Input
```bash
# Via Graylog Web UI:
System > Inputs > Select GELF UDP > Launch new input

# Configuration:
Port: 12201
Bind address: 0.0.0.0
Recv buffer size: 262144
```

#### Create Streams
```javascript
// Security Events Stream
{
  "title": "POAM Security Events",
  "description": "Authentication and authorization events",
  "rules": [
    {
      "field": "facility",
      "type": 1,
      "value": "poam-tracker",
      "inverted": false
    },
    {
      "field": "event_type", 
      "type": 1,
      "value": "security",
      "inverted": false
    }
  ]
}

// Audit Events Stream  
{
  "title": "POAM Audit Trail",
  "description": "Data modification audit events",
  "rules": [
    {
      "field": "facility",
      "type": 1, 
      "value": "poam-tracker",
      "inverted": false
    },
    {
      "field": "event_type",
      "type": 1,
      "value": "audit", 
      "inverted": false
    }
  ]
}
```

### 2. Field Extractors

#### Import Extractors
```bash
# Import the provided extractor configuration
curl -X POST "http://graylog-server:9000/api/system/inputs/INPUT_ID/extractors" \
  -H "Content-Type: application/json" \
  -H "Authorization: Basic $(echo -n 'admin:password' | base64)" \
  -d @config/graylog/graylog-extractor.json
```

### 3. Graylog Dashboards

#### Security Dashboard Widgets
```javascript
// Failed Login Attempts (Last 24h)
{
  "type": "STATS_COUNT",
  "timerange": {"type": "relative", "range": 86400},
  "query": "event_type:security AND eventType:AUTH_FAILURE",
  "stream_id": "security_stream_id"
}

// Top Users by Activity
{
  "type": "QUICKVALUES", 
  "timerange": {"type": "relative", "range": 86400},
  "query": "facility:poam-tracker",
  "field": "user_email",
  "limit": 10
}

// Geographic IP Distribution
{
  "type": "WORLD_MAP",
  "timerange": {"type": "relative", "range": 86400}, 
  "query": "source_ip:*",
  "field": "source_ip"
}
```

## Log Format Examples

### Security Event in Splunk
```json
{
  "@timestamp": "2025-08-31T15:45:23.123Z",
  "event_type": "security",
  "event_category": "authentication", 
  "event_action": "AUTH_FAILURE",
  "event_outcome": "failure",
  "source_ip": "192.168.1.100",
  "user_email": "user@dod.gov",
  "resource_name": "/auth/login",
  "severity": "HIGH",
  "classification": "FOUO",
  "correlation_id": "req-12345",
  "application": "poam-tracker",
  "tags": ["security", "dod-compliance"]
}
```

### Audit Event in Graylog
```json
{
  "version": "1.1",
  "host": "poam-tracker-backend-01",
  "short_message": "Audit: UPDATE on PACKAGE",
  "timestamp": 1693497923.123,
  "level": 6,
  "facility": "poam-tracker",
  "event_type": "audit",
  "user_id": 123,
  "user_email": "admin@dod.gov", 
  "resource_type": "PACKAGE",
  "resource_id": "456",
  "data_before": "{\"name\":\"Old Package\"}",
  "data_after": "{\"name\":\"New Package\"}",
  "correlation_id": "req-67890"
}
```

## Alerting & Monitoring

### Splunk Alerts
```spl
# Multiple failed logins
index=security eventType=AUTH_FAILURE 
| bucket _time span=5m 
| stats count by _time, userEmail, ipAddress 
| where count >= 5
| alert when count >= 5

# Privilege escalation
index=audit action=UPDATE resource=USER newValues="*Admin*"
| alert immediate
```

### Graylog Alerts
```javascript
// Failed authentication threshold
{
  "title": "Multiple Failed Logins",
  "condition": {
    "type": "message_count",
    "threshold": 5,
    "threshold_type": "more",
    "time": 5,
    "query": "event_type:security AND eventType:AUTH_FAILURE"
  },
  "notifications": [
    {
      "type": "email",
      "configuration": {
        "recipients": ["security@organization.gov"],
        "subject": "POAM Tracker: Multiple Failed Login Attempts"
      }
    }
  ]
}
```

## Testing Integration

### Test SIEM Connectivity
```typescript
// Add to your application startup
const siemLogger = app.get(SiemLoggerService);
const connectivity = await siemLogger.testSiemConnectivity();
console.log('SIEM Connectivity:', connectivity);
```

### Generate Test Events
```bash
# Test security event
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@invalid.com","password":"wrong"}'

# Test audit event  
curl -X POST http://localhost:3001/packages \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Package","description":"Test"}'
```

## Compliance Benefits

### DOD Requirements Met
- **Centralized logging**: All events in SIEM
- **Real-time monitoring**: Immediate threat detection
- **7-year retention**: Automated in Splunk/Graylog
- **Audit trails**: Complete data modification history
- **Correlation tracking**: End-to-end request tracing
- **Classification marking**: FOUO tags on sensitive data

### NIST Cybersecurity Framework
- **Identify**: Asset and user identification
- **Protect**: Access control monitoring
- **Detect**: Real-time security event detection
- **Respond**: Automated alerting and workflows
- **Recover**: Audit trails for incident response

This integration provides enterprise-grade security monitoring suitable for DOD environments and enables comprehensive compliance reporting.
