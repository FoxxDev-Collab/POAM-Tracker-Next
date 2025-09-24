import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AppLoggerService } from '../logging/logger.service';

export interface RequestWithCorrelation extends Request {
  correlationId?: string;
  startTime?: number;
}

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  constructor(private readonly logger: AppLoggerService) {}

  use(req: RequestWithCorrelation, res: Response, next: NextFunction) {
    const correlationId = this.logger.generateCorrelationId();
    const startTime = Date.now();

    req.correlationId = correlationId;
    req.startTime = startTime;

    // Add correlation ID to response headers
    res.setHeader('X-Correlation-ID', correlationId);

    // Log incoming request
    this.logger.log(
      `Incoming ${req.method} ${req.originalUrl}`,
      'HTTP',
      correlationId,
    );

    // Log request details for security monitoring
    if (this.isSensitiveEndpoint(req.originalUrl)) {
      this.logger.logSecurityEvent({
        eventType: 'DATA_ACCESS',
        userId: (req as Request & { user?: { id: number; email: string } }).user?.id,
        userEmail: (req as Request & { user?: { id: number; email: string } }).user?.email,
        ipAddress: this.getClientIp(req),
        userAgent: req.get('User-Agent'),
        resource: req.originalUrl,
        action: req.method,
        correlationId,
        details: {
          query: req.query,
          params: req.params,
        },
      });
    }

    // Override res.json to log responses
    const originalJson = res.json;
    res.json = function (body) {
      const duration = Date.now() - startTime;

      // Log response
      const logger = (req as RequestWithCorrelation & { logger?: AppLoggerService }).logger || new AppLoggerService(); // Fallback, though this shouldn't happen

      logger.log(
        `Response ${res.statusCode} ${req.method} ${req.originalUrl} - ${duration}ms`,
        'HTTP',
        correlationId,
      );

      // Log errors
      if (res.statusCode >= 400) {
        logger.error(
          `HTTP Error ${res.statusCode}: ${req.method} ${req.originalUrl}`,
          JSON.stringify(body),
          'HTTP',
          correlationId,
        );
      }

      return originalJson.call(this, body);
    };

    next();
  }

  private isSensitiveEndpoint(url: string): boolean {
    const sensitivePatterns = [
      '/auth/',
      '/users/',
      '/packages/',
      '/systems/',
      '/groups/',
      '/poams/',
      '/stps/',
    ];

    return sensitivePatterns.some((pattern) => url.includes(pattern));
  }

  private getClientIp(req: Request): string {
    return (
      (req.headers['x-forwarded-for'] as string) ||
      (req.headers['x-real-ip'] as string) ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      'unknown'
    );
  }
}
