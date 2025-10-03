import { Test, TestingModule } from '@nestjs/testing';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JwtStrategy],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    it('should return user object from JWT payload', () => {
      const payload = {
        sub: '1',
        email: 'john@test.com',
        role: 'Admin',
      };

      const result = strategy.validate(payload);

      expect(result).toEqual({
        id: '1',
        email: 'john@test.com',
        role: 'Admin',
      });
    });

    it('should map sub to id', () => {
      const payload = {
        sub: '123',
        email: 'user@test.com',
        role: 'Auditor',
      };

      const result = strategy.validate(payload);

      expect(result.id).toBe('123');
    });

    it('should preserve email and role', () => {
      const payload = {
        sub: '1',
        email: 'test@example.com',
        role: 'ISSO',
      };

      const result = strategy.validate(payload);

      expect(result.email).toBe('test@example.com');
      expect(result.role).toBe('ISSO');
    });

    it('should handle different user roles', () => {
      const roles = ['Admin', 'ISSM', 'ISSO', 'SysAdmin', 'ISSE', 'Auditor'];

      roles.forEach(role => {
        const payload = {
          sub: '1',
          email: 'user@test.com',
          role,
        };

        const result = strategy.validate(payload);

        expect(result.role).toBe(role);
      });
    });
  });
});
