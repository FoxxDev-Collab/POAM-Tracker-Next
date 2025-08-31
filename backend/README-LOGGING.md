# POAM Tracker Backend - DOD Compliance Logging

## Overview
This backend implements comprehensive logging designed to meet Department of Defense (DOD) security and compliance requirements. The logging system provides structured, auditable, and secure event tracking across all application components.

## Logging Architecture

### 1. **Winston-Based Multi-Logger System**
- **Application Logger**: General application events and errors
- **Security Logger**: Authentication, authorization, and security events
- **Audit Logger**: Data modification and sensitive operation tracking

### 2. **Log Classifications**
- **FOUO (For Official Use Only)**: Security and audit logs
- **Standard**: Application operational logs
- **Structured JSON**: All logs use consistent JSON formatting

### 3. **Retention Policies**
- **Application Logs**: 30 days rotation
- **Security/Audit Logs**: 7 years retention (2555 days) for DOD compliance
- **Daily Rotation**: 20MB file size limit with automatic rotation

## Security Event Types

### Authentication Events
- `AUTH_SUCCESS`: Successful user authentication
- `AUTH_FAILURE`: Failed login attempts
- `ACCESS_DENIED`: Unauthorized access attempts

### Data Events
- `DATA_ACCESS`: Sensitive endpoint access
- `DATA_MODIFICATION`: CRUD operations on sensitive data
- `ADMIN_ACTION`: Administrative operations

### System Events
- `SYSTEM_ERROR`: Application errors and exceptions

## Audit Trail Features

### Automatic Audit Logging
Controllers decorated with `@Audit()` automatically log:
- User ID and email
- IP address and user agent
- Resource and action performed
- Correlation IDs for request tracking
- Before/after values for modifications

### Example Usage
```typescript
@Post()
@Audit({ action: 'CREATE', resource: 'PACKAGE', sensitiveData: true })
create(@Body() createDto: CreateDto) {
  return this.service.create(createDto);
}
```

## Correlation ID Tracking
Every request receives a unique correlation ID that:
- Tracks requests across all logs
- Enables end-to-end request tracing
- Appears in response headers as `X-Correlation-ID`
- Links related security and audit events

## Log File Structure

### Directory Layout
```
logs/
├── application-YYYY-MM-DD.log     # Application events
├── security-YYYY-MM-DD.log        # Security events (7yr retention)
├── audit-YYYY-MM-DD.log           # Audit trail (7yr retention)
├── audit-application.json         # Application log metadata
├── audit-security.json            # Security log metadata
└── audit-trail.json               # Audit log metadata
```

### Log Entry Format
```json
{
  "timestamp": "2025-08-31 09:45:23.123",
  "level": "SECURITY",
  "message": "Security Event",
  "classification": "FOUO",
  "eventId": "uuid-v4",
  "eventType": "AUTH_SUCCESS",
  "userId": 123,
  "userEmail": "user@dod.gov",
  "ipAddress": "192.168.1.100",
  "userAgent": "Mozilla/5.0...",
  "resource": "/auth/login",
  "action": "LOGIN_SUCCESS",
  "correlationId": "req-uuid-v4",
  "severity": "LOW"
}
```

## Security Features

### Rate Limiting
- 100 requests per 15-minute window per IP
- Configurable via environment variables
- Automatic blocking of excessive requests

### Security Headers
- Helmet.js integration for security headers
- CORS configuration for frontend integration
- Request validation and sanitization

### IP Address Tracking
Captures client IP from multiple sources:
- `X-Forwarded-For` header
- `X-Real-IP` header
- Direct connection IP
- Socket remote address

## Environment Configuration

### Required Environment Variables
```bash
# Logging
LOG_LEVEL="info"                    # debug, info, warn, error
NODE_ENV="production"               # development, production

# Security
JWT_SECRET="your-secret-key"
RATE_LIMIT_WINDOW_MS=900000        # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100

# Application
PORT=3001
FRONTEND_URL="http://localhost:3000"
```

## Compliance Features

### DOD Requirements Met
- **7-year log retention** for security and audit events
- **Structured logging** with consistent formatting
- **User activity tracking** with full attribution
- **IP address logging** for all requests
- **Correlation ID tracking** for forensic analysis
- **Classification marking** (FOUO) on sensitive logs
- **Automatic log rotation** to prevent disk exhaustion

### NIST Cybersecurity Framework Alignment
- **Identify**: User and system identification in all logs
- **Protect**: Access control logging and monitoring
- **Detect**: Security event detection and logging
- **Respond**: Structured incident response data
- **Recover**: Audit trail for system recovery

## Monitoring and Alerting

### Log Analysis
Logs can be ingested by:
- Splunk Enterprise Security
- Elastic Stack (ELK)
- AWS CloudWatch
- Azure Monitor
- Custom SIEM solutions

### Key Metrics to Monitor
- Failed authentication attempts
- Privilege escalation attempts
- Data access patterns
- System error rates
- Response time anomalies

## Usage Examples

### Manual Security Event Logging
```typescript
this.logger.logSecurityEvent({
  eventType: 'ACCESS_DENIED',
  userId: user.id,
  userEmail: user.email,
  ipAddress: req.ip,
  userAgent: req.get('User-Agent'),
  resource: '/sensitive-data',
  action: 'READ_ATTEMPT',
  details: { reason: 'Insufficient privileges' }
});
```

### Manual Audit Event Logging
```typescript
this.logger.logAuditEvent({
  action: 'UPDATE',
  resource: 'USER_PROFILE',
  resourceId: userId,
  userId: currentUser.id,
  userEmail: currentUser.email,
  oldValues: { role: 'User' },
  newValues: { role: 'Admin' }
});
```

## Best Practices

### For Developers
1. Use `@Audit()` decorator on all CRUD operations
2. Include correlation IDs in error handling
3. Log security events for authentication flows
4. Never log sensitive data in plain text
5. Use appropriate log levels (debug, info, warn, error)

### For Operations
1. Monitor log file sizes and rotation
2. Set up alerts for security event patterns
3. Regularly backup audit logs
4. Implement log forwarding to SIEM
5. Test log retention and retrieval procedures

## Troubleshooting

### Common Issues
- **Permission errors**: Ensure `logs/` directory is writable
- **Disk space**: Monitor log file growth and rotation
- **Performance**: Adjust log levels in production
- **Missing logs**: Check Winston transport configuration

### Log Verification
```bash
# Check recent security events
tail -f logs/security-$(date +%Y-%m-%d).log | jq '.'

# Search for specific user activity
grep "user@example.com" logs/audit-*.log

# Monitor real-time application logs
tail -f logs/application-$(date +%Y-%m-%d).log
```

This logging implementation provides enterprise-grade security monitoring and compliance capabilities suitable for DOD environments and security-conscious organizations.
