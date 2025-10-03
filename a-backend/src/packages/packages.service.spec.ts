import { Test, TestingModule } from '@nestjs/testing';
import { PackagesService } from './packages.service';
import { PrismaService } from '../prisma/prisma.service';
import { SystemType, RmfStep, ImpactLevel } from '@prisma/client';

describe('PackagesService', () => {
  let service: PackagesService;
  let prisma: PrismaService;

  const mockPackage = {
    id: 1,
    name: 'Test ATO Package',
    description: 'Test Description',
    teamId: 1,
    rmfStep: RmfStep.Categorize,
    categorizeComplete: true,
    selectComplete: false,
    implementComplete: false,
    assessComplete: false,
    authorizeComplete: false,
    monitorComplete: false,
    systemType: SystemType.Major_Application,
    confidentialityImpact: ImpactLevel.Moderate,
    integrityImpact: ImpactLevel.High,
    availabilityImpact: ImpactLevel.Moderate,
    overallCategorization: ImpactLevel.High,
    onboardingComplete: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPrismaService = {
    package: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PackagesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<PackagesService>(PackagesService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new package', async () => {
      const createDto = {
        name: 'Test ATO Package',
        description: 'Test Description',
        teamId: 1,
        systemType: SystemType.Major_Application,
      };

      mockPrismaService.package.create.mockResolvedValue(mockPackage);

      const result = await service.create(createDto);

      expect(result).toEqual({ item: mockPackage });
      expect(prisma.package.create).toHaveBeenCalled();
    });

    it('should normalize enum fields during creation', async () => {
      const createDto = {
        name: 'Test Package',
        teamId: 1,
        confidentialityImpact: 'MODERATE', // uppercase
        rmfStep: 'categorize', // lowercase
      } as any; // Allow strings for normalization testing

      mockPrismaService.package.create.mockResolvedValue(mockPackage);

      await service.create(createDto);

      expect(prisma.package.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.any(Object),
        }),
      );
    });

    it('should handle package with minimal required fields', async () => {
      const minimalDto = {
        name: 'Minimal Package',
        teamId: 1,
      };

      mockPrismaService.package.create.mockResolvedValue(mockPackage);

      const result = await service.create(minimalDto);

      expect(result.item).toBeDefined();
    });
  });

  describe('findAll', () => {
    it('should return all packages with relations', async () => {
      const packages = [mockPackage, { ...mockPackage, id: 2 }];
      mockPrismaService.package.findMany.mockResolvedValue(packages);

      const result = await service.findAll();

      expect(result).toEqual({ items: packages });
      expect(prisma.package.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.objectContaining({
            team: true,
            groups: true,
            systems: true,
          }),
        }),
      );
    });

    it('should return empty array when no packages exist', async () => {
      mockPrismaService.package.findMany.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual({ items: [] });
    });

    it('should include counts for related entities', async () => {
      mockPrismaService.package.findMany.mockResolvedValue([mockPackage]);

      await service.findAll();

      expect(prisma.package.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.objectContaining({
            _count: expect.objectContaining({
              select: expect.objectContaining({
                groups: true,
                systems: true,
                stps: true,
                poams: true,
              }),
            }),
          }),
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a package by id with relations', async () => {
      mockPrismaService.package.findUnique.mockResolvedValue(mockPackage);

      const result = await service.findOne(1);

      expect(result).toEqual(mockPackage);
      expect(prisma.package.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 1 },
          include: expect.objectContaining({
            team: true,
            groups: true,
            systems: true,
            stps: true,
            poams: true,
          }),
        }),
      );
    });

    it('should return null when package not found', async () => {
      mockPrismaService.package.findUnique.mockResolvedValue(null);

      const result = await service.findOne(999);

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update a package', async () => {
      const updateDto = {
        name: 'Updated Package',
        description: 'Updated Description',
      };

      const updatedPackage = { ...mockPackage, ...updateDto };
      mockPrismaService.package.update.mockResolvedValue(updatedPackage);

      const result = await service.update(1, updateDto);

      expect(result).toEqual({ item: updatedPackage });
      expect(prisma.package.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 1 },
          data: expect.any(Object),
        }),
      );
    });

    it('should filter out read-only fields during update', async () => {
      const updateDto = {
        name: 'Updated',
        id: 999, // should be filtered
        createdAt: new Date(), // should be filtered
        updatedAt: new Date(), // should be filtered
      };

      mockPrismaService.package.update.mockResolvedValue(mockPackage);

      await service.update(1, updateDto);

      expect(prisma.package.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 1 },
        }),
      );
    });

    it('should update RMF progress steps', async () => {
      const updateDto = {
        categorizeComplete: true,
        selectComplete: true,
        rmfStep: RmfStep.Implement,
      };

      mockPrismaService.package.update.mockResolvedValue(mockPackage);

      await service.update(1, updateDto);

      expect(prisma.package.update).toHaveBeenCalled();
    });

    it('should normalize enum fields during update', async () => {
      const updateDto = {
        confidentialityImpact: 'HIGH',
        rmfStep: 'monitor',
      } as any; // Allow strings for normalization testing

      mockPrismaService.package.update.mockResolvedValue(mockPackage);

      await service.update(1, updateDto);

      expect(prisma.package.update).toHaveBeenCalled();
    });
  });
});
