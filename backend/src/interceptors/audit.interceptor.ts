import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AppLoggerService } from '../logging/logger.service';
import { PrismaService } from '../prisma/prisma.service';
import { AUDIT_KEY, AuditOptions } from '../decorators/audit.decorator';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly logger: AppLoggerService,
    private readonly prisma: PrismaService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const auditOptions = this.reflector.get<AuditOptions>(
      AUDIT_KEY,
      context.getHandler(),
    );

    if (!auditOptions) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const correlationId = request.correlationId;

    return next.handle().pipe(
      tap((data) => {
        if (user) {
          // Log to Winston audit logger
          this.logger.logAuditEvent({
            action: auditOptions.action,
            resource: auditOptions.resource,
            resourceId: request.params?.id || data?.id,
            userId: user.id,
            userEmail: user.email,
            ipAddress: this.getClientIp(request),
            userAgent: request.get('User-Agent'),
            newValues: auditOptions.sensitiveData ? '[REDACTED]' : data,
            correlationId,
          });

          // Also save to database audit_logs table
          this.prisma.auditLog
            .create({
              data: {
                event: `${auditOptions.action}_${auditOptions.resource}`,
                data: JSON.stringify({
                  action: auditOptions.action,
                  resource: auditOptions.resource,
                  resourceId: request.params?.id || data?.id,
                  correlationId,
                  userAgent: request.get('User-Agent'),
                }),
                ipAddress: this.getClientIp(request),
                userAgent: request.get('User-Agent'),
                userId: user.id,
              },
            })
            .catch((error) => {
              this.logger.error(
                'Failed to save audit log to database',
                error.stack,
                'AuditInterceptor',
                correlationId,
              );
            });
        }
      }),
    );
  }

  private getClientIp(request: any): string {
    return (
      request.headers['x-forwarded-for'] ||
      request.headers['x-real-ip'] ||
      request.connection.remoteAddress ||
      request.socket.remoteAddress ||
      'unknown'
    );
  }
}
