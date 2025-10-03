import { Test, TestingModule } from '@nestjs/testing';
import { ScoringService } from './scoring.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ScoringService', () => {
  let service: ScoringService;
  let prisma: PrismaService;

  const mockPrismaService = {
    stigFinding: {
      findMany: jest.fn(),
    },
    systemScore: {
      upsert: jest.fn(),
      findFirst: jest.fn(),
    },
    groupScore: {
      upsert: jest.fn(),
      create: jest.fn(),
    },
    packageScore: {
      upsert: jest.fn(),
    },
    system: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    group: {
      findUnique: jest.fn(),
    },
    package: {
      findUnique: jest.fn(),
    },
    controlSystemStatus: {
      updateMany: jest.fn(),
      upsert: jest.fn(),
      findMany: jest.fn(),
    },
    controlGroupStatus: {
      upsert: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScoringService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ScoringService>(ScoringService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('calculateSystemScore', () => {
    it('should calculate score with all compliant findings', async () => {
      const findings = [
        { id: 1, status: 'Not_a_Finding', severity: 'CAT_I' },
        { id: 2, status: 'Not_a_Finding', severity: 'CAT_II' },
        { id: 3, status: 'Not_Applicable', severity: 'CAT_III' },
      ];

      mockPrismaService.stigFinding.findMany.mockResolvedValue(findings);
      mockPrismaService.systemScore.upsert.mockResolvedValue({});

      await service.calculateSystemScore(1, 1);

      expect(prisma.systemScore.upsert).toHaveBeenCalledWith({
        where: {
          systemId_scanId: {
            systemId: 1,
            scanId: 1,
          },
        },
        update: expect.objectContaining({
          complianceScore: 100,
          assessmentProgress: 100,
          openFindings: 0,
        }),
        create: expect.any(Object),
      });
    });

    it('should calculate score with open findings', async () => {
      const findings = [
        { id: 1, status: 'Open', severity: 'CAT_I' },
        { id: 2, status: 'Open', severity: 'CAT_II' },
        { id: 3, status: 'Not_a_Finding', severity: 'CAT_III' },
      ];

      mockPrismaService.stigFinding.findMany.mockResolvedValue(findings);
      mockPrismaService.systemScore.upsert.mockResolvedValue({});

      await service.calculateSystemScore(1);

      expect(prisma.systemScore.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          update: expect.objectContaining({
            openFindings: 2,
            catIOpen: 1,
            catIIOpen: 1,
            catIIIOpen: 0,
          }),
        }),
      );
    });

    it('should calculate assessment progress with not reviewed findings', async () => {
      const findings = [
        { id: 1, status: 'Not_Reviewed', severity: 'CAT_I' },
        { id: 2, status: 'Open', severity: 'CAT_II' },
        { id: 3, status: 'Not_a_Finding', severity: 'CAT_III' },
      ];

      mockPrismaService.stigFinding.findMany.mockResolvedValue(findings);
      mockPrismaService.systemScore.upsert.mockResolvedValue({});

      await service.calculateSystemScore(1);

      expect(prisma.systemScore.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          update: expect.objectContaining({
            notReviewedFindings: 1,
            assessmentProgress: expect.any(Number),
          }),
        }),
      );
    });

    it('should handle empty findings', async () => {
      mockPrismaService.stigFinding.findMany.mockResolvedValue([]);

      await service.calculateSystemScore(1);

      expect(prisma.systemScore.upsert).not.toHaveBeenCalled();
    });

    it('should use default scanId of 0 when not provided', async () => {
      const findings = [
        { id: 1, status: 'Open', severity: 'CAT_I' },
      ];

      mockPrismaService.stigFinding.findMany.mockResolvedValue(findings);
      mockPrismaService.systemScore.upsert.mockResolvedValue({});

      await service.calculateSystemScore(1);

      expect(prisma.systemScore.upsert).toHaveBeenCalledWith({
        where: {
          systemId_scanId: {
            systemId: 1,
            scanId: 0,
          },
        },
        update: expect.any(Object),
        create: expect.any(Object),
      });
    });
  });

  describe('calculateGroupScore', () => {
    it('should calculate group score from systems', async () => {
      const group = {
        id: 1,
        name: 'Test Group',
        systems: [{ id: 1 }, { id: 2 }],
      };

      const systemScore = {
        systemId: 1,
        complianceScore: 80,
        assessmentProgress: 100,
        totalFindings: 10,
        openFindings: 2,
        notReviewedFindings: 0,
        catIOpen: 1,
        catIIOpen: 1,
        catIIIOpen: 0,
      };

      mockPrismaService.group.findUnique.mockResolvedValue(group);
      mockPrismaService.systemScore.findFirst.mockResolvedValue(systemScore);
      mockPrismaService.system.findUnique.mockResolvedValue({ id: 1, name: 'System 1' });
      mockPrismaService.controlSystemStatus.findMany.mockResolvedValue([]);
      mockPrismaService.groupScore.create.mockResolvedValue({});

      await service.calculateGroupScore(1);

      expect(prisma.group.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: { systems: true },
      });
    });
  });

  describe('severity categorization', () => {
    it('should correctly count CAT I findings', async () => {
      const findings = [
        { id: 1, status: 'Open', severity: 'CAT_I' },
        { id: 2, status: 'Open', severity: 'CAT_I' },
        { id: 3, status: 'Not_a_Finding', severity: 'CAT_I' },
      ];

      mockPrismaService.stigFinding.findMany.mockResolvedValue(findings);
      mockPrismaService.systemScore.upsert.mockResolvedValue({});

      await service.calculateSystemScore(1);

      expect(prisma.systemScore.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          update: expect.objectContaining({
            catIOpen: 2,
          }),
        }),
      );
    });

    it('should correctly count CAT II findings', async () => {
      const findings = [
        { id: 1, status: 'Open', severity: 'CAT_II' },
        { id: 2, status: 'Open', severity: 'CAT_II' },
      ];

      mockPrismaService.stigFinding.findMany.mockResolvedValue(findings);
      mockPrismaService.systemScore.upsert.mockResolvedValue({});

      await service.calculateSystemScore(1);

      expect(prisma.systemScore.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          update: expect.objectContaining({
            catIIOpen: 2,
          }),
        }),
      );
    });

    it('should correctly count CAT III findings', async () => {
      const findings = [
        { id: 1, status: 'Open', severity: 'CAT_III' },
      ];

      mockPrismaService.stigFinding.findMany.mockResolvedValue(findings);
      mockPrismaService.systemScore.upsert.mockResolvedValue({});

      await service.calculateSystemScore(1);

      expect(prisma.systemScore.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          update: expect.objectContaining({
            catIIIOpen: 1,
          }),
        }),
      );
    });
  });
});
