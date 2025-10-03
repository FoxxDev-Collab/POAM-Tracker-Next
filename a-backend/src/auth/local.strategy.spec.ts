import { Test, TestingModule } from '@nestjs/testing';
import { LocalStrategy } from './local.strategy';
import { AuthService } from './auth.service';
import { UnauthorizedException } from '@nestjs/common';

describe('LocalStrategy', () => {
  let strategy: LocalStrategy;
  let authService: AuthService;

  const mockAuthService = {
    validateUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocalStrategy,
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    strategy = module.get<LocalStrategy>(LocalStrategy);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    it('should return user when credentials are valid', async () => {
      const user = {
        id: 1,
        email: 'john@test.com',
        role: 'Admin',
      };

      mockAuthService.validateUser.mockResolvedValue(user);

      const result = await strategy.validate('john@test.com', 'password123');

      expect(result).toEqual(user);
      expect(authService.validateUser).toHaveBeenCalledWith(
        'john@test.com',
        'password123',
      );
    });

    it('should throw UnauthorizedException when credentials are invalid', async () => {
      mockAuthService.validateUser.mockResolvedValue(null);

      await expect(
        strategy.validate('john@test.com', 'wrongpassword'),
      ).rejects.toThrow(UnauthorizedException);

      expect(authService.validateUser).toHaveBeenCalledWith(
        'john@test.com',
        'wrongpassword',
      );
    });

    it('should throw UnauthorizedException when user not found', async () => {
      mockAuthService.validateUser.mockResolvedValue(null);

      await expect(
        strategy.validate('nonexistent@test.com', 'password123'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should use email field for username', async () => {
      const user = { id: 1, email: 'test@test.com', role: 'Auditor' };
      mockAuthService.validateUser.mockResolvedValue(user);

      await strategy.validate('test@test.com', 'password');

      expect(authService.validateUser).toHaveBeenCalledWith(
        'test@test.com',
        expect.any(String),
      );
    });
  });
});
