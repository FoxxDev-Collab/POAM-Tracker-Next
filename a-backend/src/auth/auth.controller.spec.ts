import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService, LoginDto, RegisterDto } from './auth.service';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  const mockAuthService = {
    login: jest.fn(),
    register: jest.fn(),
  };

  const mockRequest = {
    ip: '127.0.0.1',
    connection: { remoteAddress: '127.0.0.1' },
    get: jest.fn().mockReturnValue('Mozilla/5.0'),
    user: {
      id: '1',
      email: 'john@test.com',
      role: 'Admin',
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'john@test.com',
      password: 'password123',
    };

    const loginResponse = {
      access_token: 'jwt-token-123',
      user: {
        id: 1,
        name: 'John Doe',
        email: 'john@test.com',
        role: 'Admin',
        pmoId: 1,
        isActive: true,
      },
    };

    it('should return access token and user data on successful login', async () => {
      mockAuthService.login.mockResolvedValue(loginResponse);

      const result = await controller.login(loginDto, mockRequest as any);

      expect(result).toEqual(loginResponse);
      expect(service.login).toHaveBeenCalledWith(
        loginDto,
        '127.0.0.1',
        'Mozilla/5.0',
      );
    });

    it('should extract IP address from request', async () => {
      mockAuthService.login.mockResolvedValue(loginResponse);

      await controller.login(loginDto, mockRequest as any);

      expect(service.login).toHaveBeenCalledWith(
        expect.any(Object),
        '127.0.0.1',
        expect.any(String),
      );
    });

    it('should extract user agent from request', async () => {
      mockAuthService.login.mockResolvedValue(loginResponse);

      await controller.login(loginDto, mockRequest as any);

      expect(mockRequest.get).toHaveBeenCalledWith('User-Agent');
      expect(service.login).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(String),
        'Mozilla/5.0',
      );
    });

    it('should fallback to connection.remoteAddress if req.ip is undefined', async () => {
      const reqWithoutIp = {
        ...mockRequest,
        ip: undefined,
      };
      mockAuthService.login.mockResolvedValue(loginResponse);

      await controller.login(loginDto, reqWithoutIp as any);

      expect(service.login).toHaveBeenCalledWith(
        expect.any(Object),
        '127.0.0.1',
        expect.any(String),
      );
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      mockAuthService.login.mockRejectedValue(
        new UnauthorizedException('Invalid credentials'),
      );

      await expect(controller.login(loginDto, mockRequest as any)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(controller.login(loginDto, mockRequest as any)).rejects.toThrow(
        'Invalid credentials',
      );
    });

    it('should handle login with different email formats', async () => {
      const testCases = [
        'user@test.com',
        'user.name@test.co.uk',
        'user+tag@test.com',
      ];

      for (const email of testCases) {
        mockAuthService.login.mockResolvedValue(loginResponse);
        await controller.login({ ...loginDto, email }, mockRequest as any);
        expect(service.login).toHaveBeenCalledWith(
          expect.objectContaining({ email }),
          expect.any(String),
          expect.any(String),
        );
      }
    });
  });

  describe('register', () => {
    const registerDto: RegisterDto = {
      name: 'Jane Doe',
      email: 'jane@test.com',
      password: 'password123',
      role: 'Auditor',
    };

    const registerResponse = {
      id: 2,
      name: 'Jane Doe',
      email: 'jane@test.com',
      role: 'Auditor',
    };

    it('should create a new user successfully', async () => {
      mockAuthService.register.mockResolvedValue(registerResponse);

      const result = await controller.register(registerDto);

      expect(result).toEqual(registerResponse);
      expect(service.register).toHaveBeenCalledWith(registerDto);
      expect(service.register).toHaveBeenCalledTimes(1);
    });

    it('should register user with minimal required fields', async () => {
      const minimalDto = {
        name: 'Jane Doe',
        email: 'jane@test.com',
        password: 'password123',
      };

      mockAuthService.register.mockResolvedValue(registerResponse);

      await controller.register(minimalDto);

      expect(service.register).toHaveBeenCalledWith(minimalDto);
    });

    it('should register user with specified role', async () => {
      mockAuthService.register.mockResolvedValue(registerResponse);

      await controller.register(registerDto);

      expect(service.register).toHaveBeenCalledWith(
        expect.objectContaining({ role: 'Auditor' }),
      );
    });

    it('should throw UnauthorizedException if user already exists', async () => {
      mockAuthService.register.mockRejectedValue(
        new UnauthorizedException('User already exists'),
      );

      await expect(controller.register(registerDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(controller.register(registerDto)).rejects.toThrow(
        'User already exists',
      );
    });

    it('should support all user roles', async () => {
      const roles = ['Admin', 'ISSM', 'ISSO', 'SysAdmin', 'ISSE', 'Auditor'] as const;

      for (const role of roles) {
        mockAuthService.register.mockResolvedValue({ ...registerResponse, role });
        await controller.register({ ...registerDto, role });
        expect(service.register).toHaveBeenCalledWith(
          expect.objectContaining({ role }),
        );
      }
    });
  });

  describe('getProfile', () => {
    it('should return the authenticated user profile', () => {
      const result = controller.getProfile(mockRequest as any);

      expect(result).toEqual({
        id: '1',
        email: 'john@test.com',
        role: 'Admin',
      });
    });

    it('should require JwtAuthGuard', () => {
      const guards = Reflect.getMetadata('__guards__', controller.getProfile);
      expect(guards).toBeDefined();
    });

    it('should extract user from request', () => {
      const customRequest = {
        user: {
          id: '99',
          email: 'custom@test.com',
          role: 'ISSO',
        },
      };

      const result = controller.getProfile(customRequest as any);

      expect(result).toEqual(customRequest.user);
    });

    it('should return undefined if no user in request', () => {
      const emptyRequest = {};

      const result = controller.getProfile(emptyRequest as any);

      expect(result).toBeUndefined();
    });
  });

  describe('route paths', () => {
    it('should have login route at POST /auth/login', () => {
      const loginPath = Reflect.getMetadata('path', controller.login);
      expect(loginPath).toBe('login');
    });

    it('should have register route at POST /auth/register', () => {
      const registerPath = Reflect.getMetadata('path', controller.register);
      expect(registerPath).toBe('register');
    });

    it('should have profile route at GET /auth/profile', () => {
      const profilePath = Reflect.getMetadata('path', controller.getProfile);
      expect(profilePath).toBe('profile');
    });
  });
});
