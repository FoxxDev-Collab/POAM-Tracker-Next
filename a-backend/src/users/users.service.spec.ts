import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashedPassword123'),
}));

describe('UsersService', () => {
  let service: UsersService;
  let prisma: PrismaService;

  const mockUser = {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    name: 'John Doe',
    email: 'john@test.com',
    password: 'hashedPassword123',
    role: 'Auditor' as const,
    pmoId: 1,
    isActive: true,
    lastLogin: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const safeUser = {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    name: 'John Doe',
    email: 'john@test.com',
    role: 'Auditor' as const,
    pmoId: 1,
    isActive: true,
    lastLogin: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPrismaService = {
    user: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
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

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a user with hashed password', async () => {
      const createDto = {
        name: 'John Doe',
        email: 'john@test.com',
        password: 'password123',
        role: 'Auditor' as const,
      };

      mockPrismaService.user.create.mockResolvedValue(safeUser);

      const result = await service.create(createDto);

      expect(result).toEqual(safeUser);
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          ...createDto,
          password: 'hashedPassword123',
        },
        select: expect.objectContaining({
          password: false,
        }),
      });
    });

    it('should return user without password', async () => {
      const createDto = {
        name: 'Jane Doe',
        email: 'jane@test.com',
        password: 'password123',
        role: 'Auditor' as const,
      };

      mockPrismaService.user.create.mockResolvedValue(safeUser);

      const result = await service.create(createDto);

      expect(result).not.toHaveProperty('password');
    });
  });

  describe('findAll', () => {
    it('should return all users without passwords', async () => {
      const users = [safeUser, { ...safeUser, id: 2, email: 'jane@test.com' }];
      mockPrismaService.user.findMany.mockResolvedValue(users);

      const result = await service.findAll();

      expect(result).toEqual(users);
      expect(prisma.user.findMany).toHaveBeenCalledWith({
        select: expect.objectContaining({
          password: false,
        }),
      });
    });

    it('should return empty array when no users exist', async () => {
      mockPrismaService.user.findMany.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a user by id without password', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(safeUser);

      const result = await service.findOne(1);

      expect(result).toEqual(safeUser);
      expect(result).not.toHaveProperty('password');
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        select: expect.objectContaining({
          password: false,
        }),
      });
    });

    it('should return null when user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.findOne(999);

      expect(result).toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('should return full user (with password) when finding by email', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findByEmail('john@test.com');

      expect(result).toEqual(mockUser);
      expect(result).toHaveProperty('password');
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'john@test.com' },
      });
    });

    it('should return null when user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.findByEmail('nonexistent@test.com');

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const updateDto = {
        name: 'Jane Smith',
      };

      const updatedUser = { ...safeUser, ...updateDto };
      mockPrismaService.user.update.mockResolvedValue(updatedUser);

      const result = await service.update(1, updateDto);

      expect(result).toEqual(updatedUser);
      expect(result).not.toHaveProperty('password');
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateDto,
        select: expect.objectContaining({
          password: false,
        }),
      });
    });
  });

  describe('remove', () => {
    it('should soft delete a user by setting isActive to false', async () => {
      const deactivatedUser = { ...safeUser, isActive: false };
      mockPrismaService.user.update.mockResolvedValue(deactivatedUser);

      const result = await service.remove(1);

      expect(result).toEqual(deactivatedUser);
      expect(result.isActive).toBe(false);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { isActive: false },
        select: expect.objectContaining({
          password: false,
        }),
      });
    });
  });
});
