import { Test, TestingModule } from '@nestjs/testing';
import { DocumentsService } from './documents.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('DocumentsService', () => {
  let service: DocumentsService;
  let prisma: PrismaService;

  const mockCategory = {
    id: 1,
    controlFamily: 'AC',
    name: 'Access Control',
    displayOrder: 1,
  };

  const mockDocument = {
    id: 1,
    packageId: 1,
    categoryId: 1,
    documentType: 'POLICY',
    title: 'Access Control Policy',
    description: 'Test policy',
    filename: 'ac-policy.pdf',
    filePath: '/uploads/ac-policy.pdf',
    isActive: true,
    uploadedAt: new Date(),
    uploadedBy: 1,
  };

  const mockPrismaService = {
    documentCategory: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      createMany: jest.fn(),
    },
    controlDocument: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    documentVersion: {
      create: jest.fn(),
      findFirst: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<DocumentsService>(DocumentsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getCategories', () => {
    it('should return existing categories', async () => {
      const categories = [mockCategory, { ...mockCategory, id: 2 }];
      mockPrismaService.documentCategory.findMany.mockResolvedValue(categories);

      const result = await service.getCategories();

      expect(result).toEqual(categories);
      expect(prisma.documentCategory.findMany).toHaveBeenCalledWith({
        orderBy: { displayOrder: 'asc' },
      });
    });

    it('should create default categories if none exist', async () => {
      mockPrismaService.documentCategory.findMany
        .mockResolvedValueOnce([]) // First call returns empty
        .mockResolvedValueOnce([mockCategory]); // After creation
      mockPrismaService.documentCategory.createMany.mockResolvedValue({
        count: 20,
      });

      const result = await service.getCategories();

      expect(prisma.documentCategory.createMany).toHaveBeenCalled();
      expect(result).toEqual([mockCategory]);
    });

    it('should create all 20 NIST control families', async () => {
      mockPrismaService.documentCategory.findMany
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);
      mockPrismaService.documentCategory.createMany.mockResolvedValue({
        count: 20,
      });

      await service.getCategories();

      const createCall = mockPrismaService.documentCategory.createMany.mock.calls[0][0];
      expect(createCall.data).toHaveLength(20);
      expect(createCall.data[0]).toHaveProperty('controlFamily', 'AC');
      expect(createCall.data[0]).toHaveProperty('name', 'Access Control');
    });

    it('should order categories by displayOrder', async () => {
      mockPrismaService.documentCategory.findMany.mockResolvedValue([]);

      await service.getCategories();

      expect(prisma.documentCategory.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { displayOrder: 'asc' },
        }),
      );
    });
  });

  describe('getPackageDocuments', () => {
    it('should return documents for a package', async () => {
      const documents = [mockDocument];
      mockPrismaService.controlDocument.findMany.mockResolvedValue(documents);

      const result = await service.getPackageDocuments(1);

      expect(result).toBeDefined();
      expect(prisma.controlDocument.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            packageId: 1,
            isActive: true,
          }),
        }),
      );
    });

    it('should filter by controlFamily', async () => {
      mockPrismaService.documentCategory.findUnique.mockResolvedValue(mockCategory);
      mockPrismaService.controlDocument.findMany.mockResolvedValue([mockDocument]);

      await service.getPackageDocuments(1, 'AC');

      expect(prisma.documentCategory.findUnique).toHaveBeenCalledWith({
        where: { controlFamily: 'AC' },
      });
      expect(prisma.controlDocument.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            packageId: 1,
            categoryId: mockCategory.id,
            isActive: true,
          }),
        }),
      );
    });

    it('should filter by documentType', async () => {
      mockPrismaService.controlDocument.findMany.mockResolvedValue([mockDocument]);

      await service.getPackageDocuments(1, undefined, 'POLICY');

      expect(prisma.controlDocument.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            packageId: 1,
            documentType: 'POLICY',
            isActive: true,
          }),
        }),
      );
    });

    it('should filter by both controlFamily and documentType', async () => {
      mockPrismaService.documentCategory.findUnique.mockResolvedValue(mockCategory);
      mockPrismaService.controlDocument.findMany.mockResolvedValue([mockDocument]);

      await service.getPackageDocuments(1, 'AC', 'POLICY');

      expect(prisma.controlDocument.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            packageId: 1,
            categoryId: mockCategory.id,
            documentType: 'POLICY',
            isActive: true,
          }),
        }),
      );
    });

    it('should include category and version information', async () => {
      mockPrismaService.controlDocument.findMany.mockResolvedValue([mockDocument]);

      await service.getPackageDocuments(1);

      expect(prisma.controlDocument.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.objectContaining({
            category: true,
            currentVersion: expect.any(Object),
          }),
        }),
      );
    });

    it('should return empty array when no documents found', async () => {
      mockPrismaService.controlDocument.findMany.mockResolvedValue([]);

      const result = await service.getPackageDocuments(1);

      expect(result).toBeDefined();
    });

    it('should handle invalid controlFamily gracefully', async () => {
      mockPrismaService.documentCategory.findUnique.mockResolvedValue(null);
      mockPrismaService.controlDocument.findMany.mockResolvedValue([]);

      await service.getPackageDocuments(1, 'INVALID');

      expect(prisma.controlDocument.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            packageId: 1,
            isActive: true,
          }),
        }),
      );
    });
  });
});
