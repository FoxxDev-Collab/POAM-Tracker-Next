import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { AppLoggerService } from '../logging/logger.service';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;
  let logger: AppLoggerService;

  const mockUser = {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    name: 'John Doe',
    email: 'john@test.com',
    password: 'hashedPassword123',
    role: 'Admin' as const,
    pmoId: 1,
    isActive: true,
    lastLogin: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUsersService = {
    findByEmail: jest.fn(),
    create: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  const mockLogger = {
    generateCorrelationId: jest.fn(),
    logSecurityEvent: jest.fn(),
    error: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: AppLoggerService,
          useValue: mockLogger,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
    logger = module.get<AppLoggerService>(AppLoggerService);

    mockLogger.generateCorrelationId.mockReturnValue('corr-123');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateUser', () => {
    it('should return user without password when credentials are valid', async () => {
      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser('john@test.com', 'password123');

      expect(result).toBeDefined();
      expect(result!.email).toBe('john@test.com');
      expect(result).not.toHaveProperty('password');
      expect(usersService.findByEmail).toHaveBeenCalledWith('john@test.com');
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedPassword123');
    });

    it('should return null when user not found', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);

      const result = await service.validateUser('nonexistent@test.com', 'password123');

      expect(result).toBeNull();
    });

    it('should return null when password is incorrect', async () => {
      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validateUser('john@test.com', 'wrongpassword');

      expect(result).toBeNull();
    });

    it('should return null when user has no password', async () => {
      const userWithoutPassword = { ...mockUser, password: null };
      mockUsersService.findByEmail.mockResolvedValue(userWithoutPassword);

      const result = await service.validateUser('john@test.com', 'password123');

      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    const loginDto = {
      email: 'john@test.com',
      password: 'password123',
    };

    beforeEach(() => {
      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue('jwt-token-123');
    });

    it('should return access token and user data on successful login', async () => {
      const result = await service.login(loginDto, '127.0.0.1', 'Mozilla/5.0');

      expect(result).toEqual({
        access_token: 'jwt-token-123',
        user: {
          id: mockUser.id,
          name: mockUser.name,
          email: mockUser.email,
          role: mockUser.role,
          pmoId: mockUser.pmoId,
          isActive: mockUser.isActive,
        },
      });
    });

    it('should generate JWT with correct payload', async () => {
      await service.login(loginDto, '127.0.0.1', 'Mozilla/5.0');

      expect(jwtService.sign).toHaveBeenCalledWith({
        email: mockUser.email,
        sub: mockUser.id,
        role: mockUser.role,
        pmoId: mockUser.pmoId,
      });
    });

    it('should log successful authentication', async () => {
      await service.login(loginDto, '127.0.0.1', 'Mozilla/5.0');

      expect(logger.logSecurityEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'AUTH_SUCCESS',
          userId: mockUser.id,
          userEmail: mockUser.email,
          ipAddress: '127.0.0.1',
          userAgent: 'Mozilla/5.0',
          action: 'LOGIN_SUCCESS',
        }),
      );
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login(loginDto, '127.0.0.1', 'Mozilla/5.0'),
      ).rejects.toThrow(UnauthorizedException);
      await expect(
        service.login(loginDto, '127.0.0.1', 'Mozilla/5.0'),
      ).rejects.toThrow('Invalid credentials');
    });

    it('should log failed authentication attempt', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      try {
        await service.login(loginDto, '127.0.0.1', 'Mozilla/5.0');
      } catch (error) {
        // Expected to throw
      }

      expect(logger.logSecurityEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'AUTH_FAILURE',
          userEmail: loginDto.email,
          ipAddress: '127.0.0.1',
          userAgent: 'Mozilla/5.0',
          action: 'LOGIN_ATTEMPT',
          details: { reason: 'Invalid credentials' },
        }),
      );
    });

    it('should handle login without IP address and user agent', async () => {
      const result = await service.login(loginDto);

      expect(result).toBeDefined();
      expect(result.access_token).toBe('jwt-token-123');
    });

    it('should throw UnauthorizedException on system error', async () => {
      mockUsersService.findByEmail.mockRejectedValue(new Error('Database error'));

      await expect(service.login(loginDto, '127.0.0.1', 'Mozilla/5.0')).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.login(loginDto, '127.0.0.1', 'Mozilla/5.0')).rejects.toThrow(
        'Authentication failed',
      );
    });

    it('should log system errors', async () => {
      const dbError = new Error('Database error');
      mockUsersService.findByEmail.mockRejectedValue(dbError);

      try {
        await service.login(loginDto, '127.0.0.1', 'Mozilla/5.0');
      } catch (error) {
        // Expected to throw
      }

      expect(logger.error).toHaveBeenCalledWith(
        'Login system error',
        expect.any(String),
        'AuthService',
        'corr-123',
      );
    });
  });

  describe('register', () => {
    const registerDto = {
      name: 'Jane Doe',
      email: 'jane@test.com',
      password: 'password123',
      role: 'Auditor' as const,
    };

    it('should create a new user successfully', async () => {
      const newUser = {
        id: 2,
        name: 'Jane Doe',
        email: 'jane@test.com',
        role: 'Auditor' as const,
      };

      mockUsersService.findByEmail.mockResolvedValue(null);
      mockUsersService.create.mockResolvedValue(newUser);

      const result = await service.register(registerDto);

      expect(result).toEqual(newUser);
      expect(usersService.create).toHaveBeenCalledWith({
        name: 'Jane Doe',
        email: 'jane@test.com',
        password: 'password123',
        role: 'Auditor',
      });
    });

    it('should use default role (Auditor) when not specified', async () => {
      const registerDtoWithoutRole = {
        name: 'Jane Doe',
        email: 'jane@test.com',
        password: 'password123',
      };

      mockUsersService.findByEmail.mockResolvedValue(null);
      mockUsersService.create.mockResolvedValue({});

      await service.register(registerDtoWithoutRole);

      expect(usersService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          role: 'Auditor',
        }),
      );
    });

    it('should throw UnauthorizedException if user already exists', async () => {
      mockUsersService.findByEmail.mockResolvedValue(mockUser);

      await expect(service.register(registerDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.register(registerDto)).rejects.toThrow(
        'User already exists',
      );
      expect(usersService.create).not.toHaveBeenCalled();
    });

    it('should check for existing email before creating user', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);
      mockUsersService.create.mockResolvedValue({});

      await service.register(registerDto);

      expect(usersService.findByEmail).toHaveBeenCalledWith('jane@test.com');
      expect(usersService.findByEmail).toHaveBeenCalled();
      expect(usersService.create).toHaveBeenCalled();
    });
  });
});
