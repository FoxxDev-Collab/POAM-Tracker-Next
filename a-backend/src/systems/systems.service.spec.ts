import { Test, TestingModule } from '@nestjs/testing';
import { SystemsService } from './systems.service';
import { PrismaService } from '../prisma/prisma.service';
import { SystemOperatingSystem } from '@prisma/client';

describe('SystemsService', () => {
  let service: SystemsService;
  let prisma: PrismaService;

  const mockSystem = {
    id: 1,
    packageId: 1,
    groupId: 1,
    name: 'Production Web Server',
    hostname: 'web-prod-01',
    description: 'Primary web application server',
    ipAddress: '192.168.1.10',
    operatingSystem: SystemOperatingSystem.RHEL_8,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPrismaService = {
    system: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    stigFinding: {
      findMany: jest.fn(),
      groupBy: jest.fn().mockResolvedValue([]), // Default to empty array
    },
    stigScan: {
      findMany: jest.fn(),
      findFirst: jest.fn().mockResolvedValue(null),
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SystemsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<SystemsService>(SystemsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new system', async () => {
      const createDto = {
        packageId: 1,
        groupId: 1,
        name: 'Production Web Server',
        hostname: 'web-prod-01',
        description: 'Primary web application server',
        ipAddress: '192.168.1.10',
        operatingSystem: SystemOperatingSystem.RHEL_8,
      };

      mockPrismaService.system.create.mockResolvedValue(mockSystem);

      const result = await service.create(createDto);

      expect(result).toEqual({ item: mockSystem });
      expect(prisma.system.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            packageId: createDto.packageId,
            groupId: createDto.groupId,
            name: createDto.name,
            hostname: createDto.hostname,
          }),
          include: expect.objectContaining({
            package: true,
            group: true,
          }),
        }),
      );
    });

    it('should include counts for related entities', async () => {
      const createDto = {
        packageId: 1,
        name: 'Test System',
      };

      mockPrismaService.system.create.mockResolvedValue(mockSystem);

      await service.create(createDto);

      expect(prisma.system.create).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.objectContaining({
            _count: expect.objectContaining({
              select: expect.objectContaining({
                stigScans: true,
                stigFindings: true,
                stps: true,
              }),
            }),
          }),
        }),
      );
    });
  });

  describe('findAll', () => {
    it('should return all systems', async () => {
      const systems = [mockSystem, { ...mockSystem, id: 2 }];
      mockPrismaService.system.findMany.mockResolvedValue(systems);

      const result = await service.findAll();

      expect(result).toEqual({ items: systems });
      expect(prisma.system.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.objectContaining({
            package: true,
            group: true,
          }),
        }),
      );
    });

    it('should return empty array when no systems exist', async () => {
      mockPrismaService.system.findMany.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual({ items: [] });
    });
  });

  describe('findByPackage', () => {
    it('should return systems for a specific package', async () => {
      const systems = [mockSystem];
      mockPrismaService.system.findMany.mockResolvedValue(systems);
      mockPrismaService.stigFinding.groupBy.mockResolvedValue([]);

      const result = await service.findByPackage(1);

      expect(result).toHaveProperty('items');
      expect(prisma.system.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { packageId: 1 },
        }),
      );
    });

    it('should include vulnerability counts', async () => {
      mockPrismaService.system.findMany.mockResolvedValue([mockSystem]);
      mockPrismaService.stigFinding.groupBy.mockResolvedValue([
        { severity: 'CAT_I', _count: { severity: 5 } },
      ]);

      await service.findByPackage(1);

      expect(prisma.system.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.objectContaining({
            _count: expect.any(Object),
          }),
        }),
      );
    });
  });

  describe('findByGroup', () => {
    it('should return systems for a specific group', async () => {
      const systems = [mockSystem];
      mockPrismaService.system.findMany.mockResolvedValue(systems);
      mockPrismaService.stigFinding.groupBy.mockResolvedValue([]);

      const result = await service.findByGroup(1);

      expect(result).toBeDefined();
      expect(prisma.system.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { groupId: 1 },
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a system by id', async () => {
      mockPrismaService.system.findUnique.mockResolvedValue(mockSystem);

      const result = await service.findOne(1);

      expect(result).toEqual(mockSystem);
      expect(prisma.system.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 1 },
          include: expect.any(Object),
        }),
      );
    });

    it('should return null when system not found', async () => {
      mockPrismaService.system.findUnique.mockResolvedValue(null);

      const result = await service.findOne(999);

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update a system', async () => {
      const updateDto = {
        name: 'Updated Server Name',
        description: 'Updated description',
      };

      const updatedSystem = { ...mockSystem, ...updateDto };
      mockPrismaService.system.update.mockResolvedValue(updatedSystem);

      const result = await service.update(1, updateDto);

      expect(result).toEqual(updatedSystem);
      expect(prisma.system.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 1 },
          data: expect.any(Object),
        }),
      );
    });
  });

  describe('remove', () => {
    it('should delete a system', async () => {
      mockPrismaService.system.delete.mockResolvedValue(mockSystem);

      const result = await service.remove(1);

      expect(result).toEqual(mockSystem);
      expect(prisma.system.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });
  });

  describe('getStigFindings', () => {
    it('should return STIG findings for a system', async () => {
      const findings = [
        { id: 1, systemId: 1, severity: 'High', ruleId: 'V-12345' },
      ];
      mockPrismaService.stigFinding.findMany.mockResolvedValue(findings);

      const result = await service.getStigFindings(1);

      expect(result).toBeDefined();
      expect(prisma.stigFinding.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { systemId: 1 },
        }),
      );
    });
  });

  describe('getStigScans', () => {
    it('should return STIG scans for a system', async () => {
      const scans = [
        { id: 1, systemId: 1, scanDate: new Date(), status: 'Completed' },
      ];
      mockPrismaService.stigScan.findMany.mockResolvedValue(scans);

      const result = await service.getStigScans(1);

      expect(result).toBeDefined();
      expect(prisma.stigScan.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { systemId: 1 },
        }),
      );
    });
  });
});
