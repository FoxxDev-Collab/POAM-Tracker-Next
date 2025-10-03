import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ConflictException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashedPassword123'),
}));

describe('Admin UsersService', () => {
  let service: UsersService;
  let prisma: PrismaService;

  const mockUser = {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@test.com',
    password: 'hashedPassword123',
    role: 'Admin' as const,
    isActive: true,
    pmoId: null,
    name: 'John Doe',
    lastLogin: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPrismaService = {
    user: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all users without passwords', async () => {
      const users = [mockUser, { ...mockUser, id: 2, email: 'jane@test.com' }];
      mockPrismaService.user.findMany.mockResolvedValue(users);

      const result = await service.findAll();

      expect(result).toEqual({ items: users });
      expect(prisma.user.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          isActive: true,
          lastLogin: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    });

    it('should return empty array when no users exist', async () => {
      mockPrismaService.user.findMany.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual({ items: [] });
    });
  });

  describe('findOne', () => {
    it('should return a user by id without password', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findOne(1);

      expect(result).toEqual(mockUser);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          isActive: true,
          lastLogin: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    });

    it('should throw NotFoundException when user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(999)).rejects.toThrow('User with ID 999 not found');
    });
  });

  describe('create', () => {
    it('should create a new user with hashed password', async () => {
      const createDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@test.com',
        password: 'password123',
        role: 'Admin' as const,
        isActive: true,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue(mockUser);

      const result = await service.create(createDto);

      expect(result).toEqual({ item: mockUser });
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@test.com',
          password: 'hashedPassword123',
          role: 'Admin',
          isActive: true,
        },
        select: expect.any(Object),
      });
    });

    it('should create user with default role (Auditor) when not specified', async () => {
      const createDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@test.com',
        password: 'password123',
      };

      const auditorUser = { ...mockUser, role: 'Auditor' as const };
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue(auditorUser);

      await service.create(createDto);

      expect(prisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            role: 'Auditor',
          }),
        }),
      );
    });

    it('should create user with default isActive (true) when not specified', async () => {
      const createDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@test.com',
        password: 'password123',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue(mockUser);

      await service.create(createDto);

      expect(prisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            isActive: true,
          }),
        }),
      );
    });

    it('should throw ConflictException if email already exists', async () => {
      const createDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@test.com',
        password: 'password123',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      await expect(service.create(createDto)).rejects.toThrow(ConflictException);
      await expect(service.create(createDto)).rejects.toThrow('Email already exists');
      expect(prisma.user.create).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update user successfully', async () => {
      const updateDto = {
        firstName: 'Jane',
        lastName: 'Smith',
      };

      const updatedUser = { ...mockUser, ...updateDto };
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue(updatedUser);

      const result = await service.update(1, updateDto);

      expect(result).toEqual({ item: updatedUser });
      expect(prisma.user.update).toHaveBeenCalled();
    });

    it('should hash password when updating password', async () => {
      const updateDto = {
        password: 'newPassword123',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue(mockUser);

      await service.update(1, updateDto);

      expect(bcrypt.hash).toHaveBeenCalledWith('newPassword123', 10);
    });

    it('should throw NotFoundException when user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.update(999, {})).rejects.toThrow(NotFoundException);
      await expect(service.update(999, {})).rejects.toThrow('User with ID 999 not found');
    });

    it('should throw ConflictException when email is already taken', async () => {
      const updateDto = {
        email: 'taken@test.com',
      };

      // First call to findUnique checks if user exists (returns mockUser)
      // Second call checks if email is taken (returns another user with that email)
      mockPrismaService.user.findUnique
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce({ ...mockUser, id: 2, email: 'taken@test.com' });

      await expect(service.update(1, updateDto)).rejects.toThrow(ConflictException);
    });

    it('should allow email update if it is the same as current email', async () => {
      const updateDto = {
        email: 'john@test.com',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue(mockUser);

      await service.update(1, updateDto);

      expect(prisma.user.update).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delete a user successfully', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.count.mockResolvedValue(2);
      mockPrismaService.user.delete.mockResolvedValue(mockUser);

      const result = await service.remove(1);

      expect(result).toEqual({
        success: true,
        message: 'User john@test.com deleted successfully',
      });
      expect(prisma.user.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should throw NotFoundException when user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
      await expect(service.remove(999)).rejects.toThrow('User with ID 999 not found');
    });

    it('should throw ConflictException when deleting the last admin', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.count.mockResolvedValue(1);

      await expect(service.remove(1)).rejects.toThrow(ConflictException);
      await expect(service.remove(1)).rejects.toThrow('Cannot delete the last admin user');
      expect(prisma.user.delete).not.toHaveBeenCalled();
    });

    it('should allow deleting admin if there are multiple admins', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.count.mockResolvedValue(3);
      mockPrismaService.user.delete.mockResolvedValue(mockUser);

      const result = await service.remove(1);

      expect(result.success).toBe(true);
      expect(prisma.user.delete).toHaveBeenCalled();
    });

    it('should allow deleting non-admin users regardless of count', async () => {
      const regularUser = { ...mockUser, role: 'Auditor' as const };
      mockPrismaService.user.findUnique.mockResolvedValue(regularUser);
      mockPrismaService.user.delete.mockResolvedValue(regularUser);

      const result = await service.remove(1);

      expect(result.success).toBe(true);
      expect(prisma.user.count).not.toHaveBeenCalled();
    });
  });
});
