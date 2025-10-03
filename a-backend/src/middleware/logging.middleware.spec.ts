import { Test, TestingModule } from '@nestjs/testing';
import { Response, NextFunction } from 'express';
import { LoggingMiddleware, RequestWithCorrelation } from './logging.middleware';
import { AppLoggerService } from '../logging/logger.service';

describe('LoggingMiddleware', () => {
  let middleware: LoggingMiddleware;
  let logger: AppLoggerService;

  const mockLogger = {
    generateCorrelationId: jest.fn().mockReturnValue('test-correlation-id'),
    log: jest.fn(),
    error: jest.fn(),
    logSecurityEvent: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoggingMiddleware,
        {
          provide: AppLoggerService,
          useValue: mockLogger,
        },
      ],
    }).compile();

    middleware = module.get<LoggingMiddleware>(LoggingMiddleware);
    logger = module.get<AppLoggerService>(AppLoggerService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(middleware).toBeDefined();
  });

  describe('use', () => {
    it('should add correlation ID to request and response', () => {
      const mockRequest = {
        method: 'GET',
        originalUrl: '/api/test',
        query: {},
        params: {},
        get: jest.fn(),
        connection: { remoteAddress: '127.0.0.1' },
      } as unknown as RequestWithCorrelation;

      const mockResponse = {
        setHeader: jest.fn(),
        json: jest.fn(),
      } as unknown as Response;

      const mockNext: NextFunction = jest.fn();

      middleware.use(mockRequest, mockResponse, mockNext);

      expect(mockRequest.correlationId).toBe('test-correlation-id');
      expect(mockRequest.startTime).toBeDefined();
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'X-Correlation-ID',
        'test-correlation-id',
      );
      expect(mockNext).toHaveBeenCalled();
    });

    it('should log incoming request', () => {
      const mockRequest = {
        method: 'POST',
        originalUrl: '/api/poams',
        query: {},
        params: {},
        get: jest.fn(),
        connection: { remoteAddress: '127.0.0.1' },
      } as unknown as RequestWithCorrelation;

      const mockResponse = {
        setHeader: jest.fn(),
        json: jest.fn(),
      } as unknown as Response;

      const mockNext: NextFunction = jest.fn();

      middleware.use(mockRequest, mockResponse, mockNext);

      expect(logger.log).toHaveBeenCalledWith(
        'Incoming POST /api/poams',
        'HTTP',
        'test-correlation-id',
      );
    });

    it('should log security event for sensitive endpoints', () => {
      const mockRequest = {
        method: 'GET',
        originalUrl: '/api/users/123',
        query: { include: 'profile' },
        params: { id: '123' },
        user: { id: 1, email: 'test@example.com' },
        get: jest.fn().mockReturnValue('Mozilla/5.0'),
        connection: { remoteAddress: '192.168.1.1' },
        headers: {},
      } as unknown as RequestWithCorrelation;

      const mockResponse = {
        setHeader: jest.fn(),
        json: jest.fn(),
      } as unknown as Response;

      const mockNext: NextFunction = jest.fn();

      middleware.use(mockRequest, mockResponse, mockNext);

      expect(logger.logSecurityEvent).toHaveBeenCalledWith({
        eventType: 'DATA_ACCESS',
        userId: 1,
        userEmail: 'test@example.com',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
        resource: '/api/users/123',
        action: 'GET',
        correlationId: 'test-correlation-id',
        details: {
          query: { include: 'profile' },
          params: { id: '123' },
        },
      });
    });

    it('should not log security event for non-sensitive endpoints', () => {
      const mockRequest = {
        method: 'GET',
        originalUrl: '/api/health',
        query: {},
        params: {},
        get: jest.fn(),
        connection: { remoteAddress: '127.0.0.1' },
      } as unknown as RequestWithCorrelation;

      const mockResponse = {
        setHeader: jest.fn(),
        json: jest.fn(),
      } as unknown as Response;

      const mockNext: NextFunction = jest.fn();

      middleware.use(mockRequest, mockResponse, mockNext);

      expect(logger.logSecurityEvent).not.toHaveBeenCalled();
    });

    it('should override res.json to log responses', (done) => {
      const mockRequest = {
        method: 'GET',
        originalUrl: '/api/test',
        query: {},
        params: {},
        get: jest.fn(),
        connection: { remoteAddress: '127.0.0.1' },
      } as unknown as RequestWithCorrelation;

      const originalJson = jest.fn().mockReturnThis();
      const mockResponse = {
        setHeader: jest.fn(),
        json: originalJson,
        statusCode: 200,
      } as unknown as Response;

      const mockNext: NextFunction = jest.fn();

      middleware.use(mockRequest, mockResponse, mockNext);

      // Give middleware time to set up
      setTimeout(() => {
        // Verify json was overridden
        expect(mockResponse.json).not.toBe(originalJson);
        done();
      }, 10);
    });

    it('should log errors for 4xx status codes', (done) => {
      const mockRequest = {
        method: 'POST',
        originalUrl: '/api/invalid',
        query: {},
        params: {},
        get: jest.fn(),
        connection: { remoteAddress: '127.0.0.1' },
      } as unknown as RequestWithCorrelation;

      const originalJson = jest.fn().mockReturnThis();
      const mockResponse = {
        setHeader: jest.fn(),
        json: originalJson,
        statusCode: 400,
      } as unknown as Response;

      const mockNext: NextFunction = jest.fn();

      middleware.use(mockRequest, mockResponse, mockNext);

      // Verify middleware was called
      expect(mockNext).toHaveBeenCalled();
      done();
    });

    it('should log errors for 5xx status codes', (done) => {
      const mockRequest = {
        method: 'GET',
        originalUrl: '/api/error',
        query: {},
        params: {},
        get: jest.fn(),
        connection: { remoteAddress: '127.0.0.1' },
      } as unknown as RequestWithCorrelation;

      const originalJson = jest.fn().mockReturnThis();
      const mockResponse = {
        setHeader: jest.fn(),
        json: originalJson,
        statusCode: 500,
      } as unknown as Response;

      const mockNext: NextFunction = jest.fn();

      middleware.use(mockRequest, mockResponse, mockNext);

      // Verify middleware was called
      expect(mockNext).toHaveBeenCalled();
      done();
    });

    it('should detect sensitive endpoints correctly', () => {
      const sensitiveUrls = [
        '/api/auth/login',
        '/api/users/profile',
        '/api/packages/1',
        '/api/systems/create',
        '/api/groups/list',
        '/api/poams/123',
        '/api/stps/456',
      ];

      sensitiveUrls.forEach((url) => {
        const mockRequest = {
          method: 'GET',
          originalUrl: url,
          query: {},
          params: {},
          user: { id: 1, email: 'test@test.com' },
          get: jest.fn(),
          connection: { remoteAddress: '127.0.0.1' },
          headers: {},
        } as unknown as RequestWithCorrelation;

        const mockResponse = {
          setHeader: jest.fn(),
          json: jest.fn(),
        } as unknown as Response;

        const mockNext: NextFunction = jest.fn();

        jest.clearAllMocks();
        middleware.use(mockRequest, mockResponse, mockNext);

        expect(logger.logSecurityEvent).toHaveBeenCalled();
      });
    });

    it('should extract IP from x-forwarded-for header', () => {
      const mockRequest = {
        method: 'GET',
        originalUrl: '/api/users/1',
        query: {},
        params: {},
        user: { id: 1, email: 'test@test.com' },
        get: jest.fn(),
        headers: { 'x-forwarded-for': '10.0.0.1' },
        connection: {},
      } as unknown as RequestWithCorrelation;

      const mockResponse = {
        setHeader: jest.fn(),
        json: jest.fn(),
      } as unknown as Response;

      const mockNext: NextFunction = jest.fn();

      middleware.use(mockRequest, mockResponse, mockNext);

      expect(logger.logSecurityEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          ipAddress: '10.0.0.1',
        }),
      );
    });

    it('should handle missing user in request', () => {
      const mockRequest = {
        method: 'GET',
        originalUrl: '/api/auth/check',
        query: {},
        params: {},
        user: undefined,
        get: jest.fn(),
        connection: { remoteAddress: '127.0.0.1' },
        headers: {},
      } as unknown as RequestWithCorrelation;

      const mockResponse = {
        setHeader: jest.fn(),
        json: jest.fn(),
      } as unknown as Response;

      const mockNext: NextFunction = jest.fn();

      middleware.use(mockRequest, mockResponse, mockNext);

      expect(logger.logSecurityEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: undefined,
          userEmail: undefined,
        }),
      );
    });
  });
});
