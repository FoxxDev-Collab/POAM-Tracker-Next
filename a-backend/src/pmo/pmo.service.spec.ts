import { Test, TestingModule } from '@nestjs/testing';
import { PmoService } from './pmo.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('PmoService', () => {
  let service: PmoService;
  let prisma: PrismaService;

  const mockPmo = {
    id: 1,
    name: 'Test PMO',
    description: 'Test Description',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    users: [
      {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@test.com',
        role: 'Admin',
        isActive: true,
      },
    ],
  };

  const mockPrismaService = {
    pmo: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PmoService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<PmoService>(PmoService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new PMO', async () => {
      const createDto = {
        name: 'Test PMO',
        description: 'Test Description',
        isActive: true,
      };

      mockPrismaService.pmo.create.mockResolvedValue(mockPmo);

      const result = await service.create(createDto);

      expect(result).toEqual(mockPmo);
      expect(prisma.pmo.create).toHaveBeenCalledWith({
        data: createDto,
        include: {
          users: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              role: true,
              isActive: true,
            },
          },
        },
      });
    });

    it('should create PMO with minimal data', async () => {
      const createDto = {
        name: 'Minimal PMO',
      };

      const minimalPmo = { ...mockPmo, name: 'Minimal PMO', description: null };
      mockPrismaService.pmo.create.mockResolvedValue(minimalPmo);

      const result = await service.create(createDto);

      expect(result).toEqual(minimalPmo);
      expect(prisma.pmo.create).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return an array of PMOs', async () => {
      const pmos = [mockPmo, { ...mockPmo, id: 2, name: 'PMO 2' }];
      mockPrismaService.pmo.findMany.mockResolvedValue(pmos);

      const result = await service.findAll();

      expect(result).toEqual(pmos);
      expect(prisma.pmo.findMany).toHaveBeenCalledWith({
        include: {
          users: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              role: true,
              isActive: true,
            },
          },
        },
      });
    });

    it('should return empty array when no PMOs exist', async () => {
      mockPrismaService.pmo.findMany.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a PMO by id', async () => {
      mockPrismaService.pmo.findUnique.mockResolvedValue(mockPmo);

      const result = await service.findOne(1);

      expect(result).toEqual(mockPmo);
      expect(prisma.pmo.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: {
          users: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              role: true,
              isActive: true,
            },
          },
        },
      });
    });

    it('should throw NotFoundException when PMO not found', async () => {
      mockPrismaService.pmo.findUnique.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(999)).rejects.toThrow(
        'PMO with ID 999 not found',
      );
    });
  });

  describe('update', () => {
    it('should update a PMO', async () => {
      const updateDto = {
        name: 'Updated PMO',
        description: 'Updated Description',
      };

      const updatedPmo = { ...mockPmo, ...updateDto };

      mockPrismaService.pmo.findUnique.mockResolvedValue(mockPmo);
      mockPrismaService.pmo.update.mockResolvedValue(updatedPmo);

      const result = await service.update(1, updateDto);

      expect(result).toEqual(updatedPmo);
      expect(prisma.pmo.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateDto,
        include: {
          users: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              role: true,
              isActive: true,
            },
          },
        },
      });
    });

    it('should throw NotFoundException when updating non-existent PMO', async () => {
      mockPrismaService.pmo.findUnique.mockResolvedValue(null);

      await expect(service.update(999, { name: 'Test' })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should update only provided fields', async () => {
      const updateDto = { name: 'Only Name Updated' };
      const updatedPmo = { ...mockPmo, name: 'Only Name Updated' };

      mockPrismaService.pmo.findUnique.mockResolvedValue(mockPmo);
      mockPrismaService.pmo.update.mockResolvedValue(updatedPmo);

      const result = await service.update(1, updateDto);

      expect(result.name).toBe('Only Name Updated');
      expect(result.description).toBe(mockPmo.description);
    });
  });

  describe('remove', () => {
    it('should soft delete a PMO by setting isActive to false', async () => {
      const deactivatedPmo = { ...mockPmo, isActive: false };

      mockPrismaService.pmo.findUnique.mockResolvedValue(mockPmo);
      mockPrismaService.pmo.update.mockResolvedValue(deactivatedPmo);

      const result = await service.remove(1);

      expect(result).toEqual(deactivatedPmo);
      expect(result.isActive).toBe(false);
      expect(prisma.pmo.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { isActive: false },
        include: {
          users: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              role: true,
              isActive: true,
            },
          },
        },
      });
    });

    it('should throw NotFoundException when removing non-existent PMO', async () => {
      mockPrismaService.pmo.findUnique.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getUsersInPmo', () => {
    it('should return users in a PMO', async () => {
      mockPrismaService.pmo.findUnique.mockResolvedValue(mockPmo);

      const result = await service.getUsersInPmo(1);

      expect(result).toEqual(mockPmo.users);
    });

    it('should throw NotFoundException when PMO not found', async () => {
      mockPrismaService.pmo.findUnique.mockResolvedValue(null);

      await expect(service.getUsersInPmo(999)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return empty array when PMO has no users', async () => {
      const pmoWithoutUsers = { ...mockPmo, users: [] };
      mockPrismaService.pmo.findUnique.mockResolvedValue(pmoWithoutUsers);

      const result = await service.getUsersInPmo(1);

      expect(result).toEqual([]);
    });
  });
});
