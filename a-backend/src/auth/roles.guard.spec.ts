import { RolesGuard } from './roles.guard';
import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  const createMockExecutionContext = (user?: any, roles?: string[]): ExecutionContext => {
    const mockContext = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({ user }),
      }),
    } as unknown as ExecutionContext;

    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(roles);

    return mockContext;
  };

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should return true if no roles are required', () => {
      const context = createMockExecutionContext({ role: 'Admin' }, undefined);

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should return true if user has required role', () => {
      const user = { id: 1, email: 'admin@test.com', role: 'Admin' };
      const context = createMockExecutionContext(user, ['Admin']);

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should return false if user does not have required role', () => {
      const user = { id: 1, email: 'user@test.com', role: 'Auditor' };
      const context = createMockExecutionContext(user, ['Admin']);

      const result = guard.canActivate(context);

      expect(result).toBe(false);
    });

    it('should return false if user is not present in request', () => {
      const context = createMockExecutionContext(undefined, ['Admin']);

      const result = guard.canActivate(context);

      expect(result).toBe(false);
    });

    it('should return true if user has one of multiple required roles', () => {
      const user = { id: 1, email: 'isso@test.com', role: 'ISSO' };
      const context = createMockExecutionContext(user, ['Admin', 'ISSM', 'ISSO']);

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should return false if user has none of the required roles', () => {
      const user = { id: 1, email: 'auditor@test.com', role: 'Auditor' };
      const context = createMockExecutionContext(user, ['Admin', 'ISSM']);

      const result = guard.canActivate(context);

      expect(result).toBe(false);
    });

    it('should check all user roles', () => {
      const roles = ['Admin', 'ISSM', 'ISSO', 'SysAdmin', 'ISSE', 'Auditor'];
      
      roles.forEach(role => {
        const user = { id: 1, email: 'user@test.com', role };
        const context = createMockExecutionContext(user, [role]);
        
        const result = guard.canActivate(context);
        expect(result).toBe(true);
      });
    });

    it('should retrieve roles metadata from handler and class', () => {
      const user = { id: 1, email: 'admin@test.com', role: 'Admin' };
      const context = createMockExecutionContext(user, ['Admin']);

      guard.canActivate(context);

      expect(reflector.getAllAndOverride).toHaveBeenCalledWith(
        'roles',
        [context.getHandler(), context.getClass()],
      );
    });
  });
});
