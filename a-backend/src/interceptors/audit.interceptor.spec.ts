import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { of } from 'rxjs';
import { AuditInterceptor } from './audit.interceptor';
import { AppLoggerService } from '../logging/logger.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AuditInterceptor', () => {
  let interceptor: AuditInterceptor;
  let reflector: Reflector;
  let logger: AppLoggerService;
  let prisma: PrismaService;

  const mockReflector = {
    get: jest.fn(),
  };

  const mockLogger = {
    logAuditEvent: jest.fn(),
    error: jest.fn(),
  };

  const mockPrismaService = {
    auditLog: {
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditInterceptor,
        {
          provide: Reflector,
          useValue: mockReflector,
        },
        {
          provide: AppLoggerService,
          useValue: mockLogger,
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    interceptor = module.get<AuditInterceptor>(AuditInterceptor);
    reflector = module.get<Reflector>(Reflector);
    logger = module.get<AppLoggerService>(AppLoggerService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  describe('intercept', () => {
    it('should pass through when no audit options are present', (done) => {
      const mockContext = {
        getHandler: jest.fn(),
        switchToHttp: jest.fn(),
      } as unknown as ExecutionContext;

      const mockNext: CallHandler = {
        handle: jest.fn().mockReturnValue(of('result')),
      };

      mockReflector.get.mockReturnValue(null);

      interceptor.intercept(mockContext, mockNext).subscribe({
        next: (value) => {
          expect(value).toBe('result');
          expect(mockNext.handle).toHaveBeenCalled();
          expect(mockLogger.logAuditEvent).not.toHaveBeenCalled();
          done();
        },
      });
    });

    it('should log audit event when user is authenticated', (done) => {
      const mockRequest = {
        user: { id: 1, email: 'test@example.com' },
        correlationId: 'test-correlation-id',
        params: { id: '123' },
        headers: { 'user-agent': 'Test Agent' },
        get: jest.fn().mockReturnValue('Test Agent'),
        connection: { remoteAddress: '127.0.0.1' },
        socket: {},
      };

      const mockContext = {
        getHandler: jest.fn(),
        switchToHttp: jest.fn(() => ({
          getRequest: () => mockRequest,
        })),
      } as unknown as ExecutionContext;

      const mockNext: CallHandler = {
        handle: jest.fn().mockReturnValue(of({ id: 123, data: 'test' })),
      };

      const auditOptions = {
        action: 'CREATE',
        resource: 'POAM',
        sensitiveData: false,
      };

      mockReflector.get.mockReturnValue(auditOptions);
      mockPrismaService.auditLog.create.mockResolvedValue({});

      interceptor.intercept(mockContext, mockNext).subscribe({
        next: (value) => {
          expect(value).toEqual({ id: 123, data: 'test' });
          expect(mockLogger.logAuditEvent).toHaveBeenCalledWith({
            action: 'CREATE',
            resource: 'POAM',
            resourceId: '123',
            userId: 1,
            userEmail: 'test@example.com',
            ipAddress: '127.0.0.1',
            userAgent: 'Test Agent',
            newValues: { id: 123, data: 'test' },
            correlationId: 'test-correlation-id',
          });
          expect(prisma.auditLog.create).toHaveBeenCalled();
          done();
        },
      });
    });

    it('should redact sensitive data when sensitiveData flag is true', (done) => {
      const mockRequest = {
        user: { id: 1, email: 'test@example.com' },
        correlationId: 'test-id',
        params: {},
        headers: {},
        get: jest.fn().mockReturnValue('Agent'),
        connection: { remoteAddress: '127.0.0.1' },
        socket: {},
      };

      const mockContext = {
        getHandler: jest.fn(),
        switchToHttp: jest.fn(() => ({
          getRequest: () => mockRequest,
        })),
      } as unknown as ExecutionContext;

      const mockNext: CallHandler = {
        handle: jest.fn().mockReturnValue(of({ password: 'secret123' })),
      };

      const auditOptions = {
        action: 'UPDATE',
        resource: 'USER',
        sensitiveData: true,
      };

      mockReflector.get.mockReturnValue(auditOptions);
      mockPrismaService.auditLog.create.mockResolvedValue({});

      interceptor.intercept(mockContext, mockNext).subscribe({
        next: () => {
          expect(mockLogger.logAuditEvent).toHaveBeenCalledWith(
            expect.objectContaining({
              newValues: '[REDACTED]',
            }),
          );
          done();
        },
      });
    });

    it('should not log when user is not authenticated', (done) => {
      const mockRequest = {
        user: null,
        params: {},
        headers: {},
        get: jest.fn(),
        connection: {},
        socket: {},
      };

      const mockContext = {
        getHandler: jest.fn(),
        switchToHttp: jest.fn(() => ({
          getRequest: () => mockRequest,
        })),
      } as unknown as ExecutionContext;

      const mockNext: CallHandler = {
        handle: jest.fn().mockReturnValue(of('result')),
      };

      mockReflector.get.mockReturnValue({ action: 'READ', resource: 'DATA' });

      interceptor.intercept(mockContext, mockNext).subscribe({
        next: () => {
          expect(mockLogger.logAuditEvent).not.toHaveBeenCalled();
          expect(prisma.auditLog.create).not.toHaveBeenCalled();
          done();
        },
      });
    });

    it('should handle database save errors gracefully', (done) => {
      const mockRequest = {
        user: { id: 1, email: 'test@example.com' },
        correlationId: 'test-id',
        params: {},
        headers: {},
        get: jest.fn().mockReturnValue('Agent'),
        connection: { remoteAddress: '127.0.0.1' },
        socket: {},
      };

      const mockContext = {
        getHandler: jest.fn(),
        switchToHttp: jest.fn(() => ({
          getRequest: () => mockRequest,
        })),
      } as unknown as ExecutionContext;

      const mockNext: CallHandler = {
        handle: jest.fn().mockReturnValue(of('result')),
      };

      mockReflector.get.mockReturnValue({ action: 'DELETE', resource: 'ITEM' });
      mockPrismaService.auditLog.create.mockRejectedValue(new Error('DB Error'));

      interceptor.intercept(mockContext, mockNext).subscribe({
        next: () => {
          // Should still complete successfully even if DB save fails
          expect(mockLogger.logAuditEvent).toHaveBeenCalled();
          setTimeout(() => {
            expect(mockLogger.error).toHaveBeenCalledWith(
              'Failed to save audit log to database',
              expect.any(String),
              'AuditInterceptor',
              'test-id',
            );
            done();
          }, 100);
        },
      });
    });

    it('should extract IP from x-forwarded-for header', (done) => {
      const mockRequest = {
        user: { id: 1, email: 'test@example.com' },
        correlationId: 'test-id',
        params: {},
        headers: { 'x-forwarded-for': '192.168.1.1' },
        get: jest.fn().mockReturnValue('Agent'),
        connection: {},
        socket: {},
      };

      const mockContext = {
        getHandler: jest.fn(),
        switchToHttp: jest.fn(() => ({
          getRequest: () => mockRequest,
        })),
      } as unknown as ExecutionContext;

      const mockNext: CallHandler = {
        handle: jest.fn().mockReturnValue(of('result')),
      };

      mockReflector.get.mockReturnValue({ action: 'READ', resource: 'DATA' });
      mockPrismaService.auditLog.create.mockResolvedValue({});

      interceptor.intercept(mockContext, mockNext).subscribe({
        next: () => {
          expect(mockLogger.logAuditEvent).toHaveBeenCalledWith(
            expect.objectContaining({
              ipAddress: '192.168.1.1',
            }),
          );
          done();
        },
      });
    });

    it('should handle array x-forwarded-for header', (done) => {
      const mockRequest = {
        user: { id: 1, email: 'test@example.com' },
        correlationId: 'test-id',
        params: {},
        headers: { 'x-forwarded-for': ['10.0.0.1', '10.0.0.2'] },
        get: jest.fn().mockReturnValue('Agent'),
        connection: {},
        socket: {},
      };

      const mockContext = {
        getHandler: jest.fn(),
        switchToHttp: jest.fn(() => ({
          getRequest: () => mockRequest,
        })),
      } as unknown as ExecutionContext;

      const mockNext: CallHandler = {
        handle: jest.fn().mockReturnValue(of('result')),
      };

      mockReflector.get.mockReturnValue({ action: 'READ', resource: 'DATA' });
      mockPrismaService.auditLog.create.mockResolvedValue({});

      interceptor.intercept(mockContext, mockNext).subscribe({
        next: () => {
          expect(mockLogger.logAuditEvent).toHaveBeenCalledWith(
            expect.objectContaining({
              ipAddress: '10.0.0.1',
            }),
          );
          done();
        },
      });
    });
  });
});
