import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { AppLoggerService } from '../logging/logger.service';
import * as bcrypt from 'bcryptjs';

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
  role?: 'Admin' | 'ISSM' | 'ISSO' | 'SysAdmin' | 'ISSE' | 'Auditor';
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private logger: AppLoggerService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (
      user &&
      user.passwordHash &&
      (await bcrypt.compare(password, user.passwordHash))
    ) {
      const { passwordHash, ...result } = user;
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto, ipAddress?: string, userAgent?: string) {
    const correlationId = this.logger.generateCorrelationId();

    try {
      const user = await this.validateUser(loginDto.email, loginDto.password);
      if (!user) {
        // Log failed authentication attempt
        this.logger.logSecurityEvent({
          eventType: 'AUTH_FAILURE',
          userEmail: loginDto.email,
          ipAddress,
          userAgent,
          resource: '/auth/login',
          action: 'LOGIN_ATTEMPT',
          correlationId,
          details: { reason: 'Invalid credentials' },
        });
        throw new UnauthorizedException('Invalid credentials');
      }

      // Log successful authentication
      this.logger.logSecurityEvent({
        eventType: 'AUTH_SUCCESS',
        userId: user.id,
        userEmail: user.email,
        ipAddress,
        userAgent,
        resource: '/auth/login',
        action: 'LOGIN_SUCCESS',
        correlationId,
      });

      const payload = { email: user.email, sub: user.id, role: user.role };
      return {
        access_token: this.jwtService.sign(payload),
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          active: user.active,
        },
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      this.logger.error(
        'Login system error',
        error.stack,
        'AuthService',
        correlationId,
      );
      throw new UnauthorizedException('Authentication failed');
    }
  }

  async register(registerDto: RegisterDto) {
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new UnauthorizedException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 12);
    const user = await this.usersService.create({
      ...registerDto,
      passwordHash: hashedPassword,
      role: registerDto.role || 'Auditor',
    });

    const { passwordHash, ...result } = user;
    return result;
  }
}
