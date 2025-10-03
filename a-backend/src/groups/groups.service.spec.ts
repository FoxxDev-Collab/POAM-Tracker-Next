import { Test, TestingModule } from '@nestjs/testing';
import { GroupsService } from './groups.service';
import { PrismaService } from '../prisma/prisma.service';

describe('GroupsService', () => {
  let service: GroupsService;
  let prisma: PrismaService;

  const mockGroup = {
    id: 1,
    name: 'Test Group',
    description: 'Test Description',
    packageId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPrismaService = {
    group: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    stigFinding: {
      groupBy: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GroupsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<GroupsService>(GroupsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new group', async () => {
      const createDto = {
        name: 'New Group',
        description: 'Description',
        packageId: 1,
      };

      mockPrismaService.group.create.mockResolvedValue(mockGroup);

      const result = await service.create(createDto);

      expect(result).toEqual({ item: mockGroup });
      expect(prisma.group.create).toHaveBeenCalledWith({
        data: createDto,
      });
    });

    it('should create group with minimal data', async () => {
      const createDto = {
        name: 'Minimal Group',
        packageId: 1,
      };

      mockPrismaService.group.create.mockResolvedValue(mockGroup);

      const result = await service.create(createDto);

      expect(result.item).toBeDefined();
    });
  });

  describe('findAll', () => {
    it('should return all groups with relations', async () => {
      const groups = [mockGroup, { ...mockGroup, id: 2 }];
      mockPrismaService.group.findMany.mockResolvedValue(groups);

      const result = await service.findAll();

      expect(result).toEqual(groups);
      expect(prisma.group.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.objectContaining({
            package: true,
            systems: true,
          }),
        }),
      );
    });

    it('should return empty array when no groups exist', async () => {
      mockPrismaService.group.findMany.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });

    it('should include counts for related entities', async () => {
      mockPrismaService.group.findMany.mockResolvedValue([mockGroup]);

      await service.findAll();

      expect(prisma.group.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.objectContaining({
            _count: expect.objectContaining({
              select: expect.objectContaining({
                systems: true,
                poams: true,
              }),
            }),
          }),
        }),
      );
    });
  });

  describe('findByPackage', () => {
    it('should return groups for a specific package with stats', async () => {
      const groupWithSystems = {
        ...mockGroup,
        systems: [{ id: 1, name: 'System 1' }],
      };

      mockPrismaService.group.findMany.mockResolvedValue([groupWithSystems]);
      mockPrismaService.stigFinding.groupBy.mockResolvedValue([
        { severity: 'CAT_I', _count: { severity: 2 } },
        { severity: 'CAT_II', _count: { severity: 5 } },
      ]);

      const result = await service.findByPackage(1);

      expect(result.items).toHaveLength(1);
      expect(result.items[0]).toHaveProperty('stats');
      expect(result.items[0].stats).toHaveProperty('totalFindings');
      expect(result.items[0].stats).toHaveProperty('complianceScore');
    });

    it('should calculate vulnerability stats correctly', async () => {
      const groupWithSystems = {
        ...mockGroup,
        systems: [{ id: 1, name: 'System 1' }],
      };

      mockPrismaService.group.findMany.mockResolvedValue([groupWithSystems]);
      mockPrismaService.stigFinding.groupBy.mockResolvedValue([
        { severity: 'CAT_I', _count: { severity: 3 } },
        { severity: 'CAT_II', _count: { severity: 5 } },
        { severity: 'CAT_III', _count: { severity: 2 } },
      ]);

      const result = await service.findByPackage(1);

      expect(result.items[0].stats.catIFindings).toBe(3);
      expect(result.items[0].stats.catIIFindings).toBe(5);
      expect(result.items[0].stats.catIIIFindings).toBe(2);
      expect(result.items[0].stats.totalFindings).toBe(10);
    });

    it('should handle groups with no systems', async () => {
      const groupWithoutSystems = {
        ...mockGroup,
        systems: [],
      };

      mockPrismaService.group.findMany.mockResolvedValue([groupWithoutSystems]);

      const result = await service.findByPackage(1);

      expect(result.items).toHaveLength(1);
      expect(result.items[0].stats.totalFindings).toBe(0);
      expect(result.items[0].stats.complianceScore).toBe(100);
    });

    it('should calculate compliance score correctly', async () => {
      const groupWithSystems = {
        ...mockGroup,
        systems: [{ id: 1, name: 'System 1' }],
      };

      mockPrismaService.group.findMany.mockResolvedValue([groupWithSystems]);
      mockPrismaService.stigFinding.groupBy.mockResolvedValue([]);

      const result = await service.findByPackage(1);

      // No findings = 100% compliance
      expect(result.items[0].stats.complianceScore).toBe(100);
    });
  });

  describe('findOne', () => {
    it('should return a group by id with relations', async () => {
      mockPrismaService.group.findUnique.mockResolvedValue(mockGroup);

      const result = await service.findOne(1);

      expect(result).toEqual(mockGroup);
      expect(prisma.group.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 1 },
          include: expect.objectContaining({
            package: true,
            systems: true,
            poams: true,
          }),
        }),
      );
    });

    it('should return null when group not found', async () => {
      mockPrismaService.group.findUnique.mockResolvedValue(null);

      const result = await service.findOne(999);

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update a group', async () => {
      const updateDto = {
        name: 'Updated Group',
        description: 'Updated Description',
      };

      const updatedGroup = { ...mockGroup, ...updateDto };
      mockPrismaService.group.update.mockResolvedValue(updatedGroup);

      const result = await service.update(1, updateDto);

      expect(result).toEqual(updatedGroup);
      expect(prisma.group.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 1 },
          data: updateDto,
        }),
      );
    });
  });

  describe('remove', () => {
    it('should delete a group', async () => {
      mockPrismaService.group.delete.mockResolvedValue(mockGroup);

      const result = await service.remove(1);

      expect(result).toEqual(mockGroup);
      expect(prisma.group.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });
  });
});
