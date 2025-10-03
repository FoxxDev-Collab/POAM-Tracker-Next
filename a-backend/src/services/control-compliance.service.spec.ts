import { Test, TestingModule } from '@nestjs/testing';
import { ControlComplianceService } from './control-compliance.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ControlComplianceService', () => {
  let service: ControlComplianceService;
  let prisma: PrismaService;

  const mockPrismaService = {
    nistControl: {
      update: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    controlSystemStatus: {
      findMany: jest.fn(),
    },
    stigFinding: {
      findMany: jest.fn(),
      groupBy: jest.fn(),
      count: jest.fn(),
    },
    cciControlMapping: {
      updateMany: jest.fn(),
    },
    system: {
      count: jest.fn(),
    },
    group: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ControlComplianceService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ControlComplianceService>(ControlComplianceService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('calculateControlComplianceScore', () => {
    it('should calculate compliance score for a control', async () => {
      const systemAssessments = [
        {
          systemId: 1,
          controlId: 'AC-1',
          hasFindings: true,
          openCount: 2,
          criticalCount: 1,
          totalFindings: 5,
          complianceScore: 60,
          lastAssessed: new Date(),
        },
        {
          systemId: 2,
          controlId: 'AC-1',
          hasFindings: true,
          openCount: 1,
          criticalCount: 0,
          totalFindings: 3,
          complianceScore: 66,
          lastAssessed: new Date(),
        },
      ];

      mockPrismaService.controlSystemStatus.findMany.mockResolvedValue(systemAssessments);
      mockPrismaService.stigFinding.findMany.mockResolvedValue([
        { id: 1, status: 'Open', severity: 'CAT_I' },
        { id: 2, status: 'Open', severity: 'CAT_II' },
        { id: 3, status: 'Not_a_Finding', severity: 'CAT_III' },
      ]);

      const result = await service.calculateControlComplianceScore('AC-1');

      expect(result).toBeDefined();
      expect(result).toHaveProperty('controlId', 'AC-1');
      expect(result).toHaveProperty('totalFindings');
      expect(result).toHaveProperty('openFindings');
      expect(result).toHaveProperty('overallScore');
    });

    it('should return null when no assessments exist', async () => {
      mockPrismaService.controlSystemStatus.findMany.mockResolvedValue([]);

      const result = await service.calculateControlComplianceScore('AC-99');

      expect(result).toBeNull();
    });

    it('should calculate correct overall score', async () => {
      const systemAssessments = [
        {
          systemId: 1,
          controlId: 'AC-2',
          hasFindings: true,
          openCount: 0,
          criticalCount: 0,
          totalFindings: 10,
          complianceScore: 100,
          lastAssessed: new Date(),
        },
      ];

      mockPrismaService.controlSystemStatus.findMany.mockResolvedValue(systemAssessments);
      mockPrismaService.stigFinding.findMany.mockResolvedValue([
        { id: 1, status: 'Not_a_Finding', severity: 'CAT_I' },
        { id: 2, status: 'Not_a_Finding', severity: 'CAT_II' },
      ]);

      const result = await service.calculateControlComplianceScore('AC-2');

      expect(result?.overallScore).toBeGreaterThan(0);
    });
  });

  describe('updateControlComplianceFromStigFindings', () => {
    it('should update compliance for specific control', async () => {
      const systemAssessments = [
        {
          systemId: 1,
          controlId: 'AC-1',
          hasFindings: true,
          openCount: 1,
          criticalCount: 1,
          totalFindings: 5,
          complianceScore: 80,
          lastAssessed: new Date(),
        },
      ];

      mockPrismaService.controlSystemStatus.findMany.mockResolvedValue(systemAssessments);
      mockPrismaService.stigFinding.findMany.mockResolvedValue([
        { id: 1, status: 'Open', severity: 'CAT_I' },
      ]);
      mockPrismaService.nistControl.update.mockResolvedValue({});
      mockPrismaService.cciControlMapping.updateMany.mockResolvedValue({});

      await service.updateControlComplianceFromStigFindings('AC-1');

      expect(prisma.nistControl.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { controlId: 'AC-1' },
          data: expect.objectContaining({
            complianceStatus: expect.any(String),
            assessedAt: expect.any(Date),
          }),
        }),
      );
    });

    it('should update compliance for all controls when no controlId specified', async () => {
      const findings = [
        { controlId: 'AC-1', id: 1, status: 'Open', severity: 'CAT_I' },
        { controlId: 'AC-2', id: 2, status: 'Open', severity: 'CAT_II' },
      ];

      const systemAssessments = [
        {
          systemId: 1,
          controlId: 'AC-1',
          hasFindings: true,
          openCount: 1,
          criticalCount: 1,
          totalFindings: 5,
          complianceScore: 80,
          lastAssessed: new Date(),
        },
      ];

      mockPrismaService.stigFinding.findMany.mockResolvedValue(findings);
      mockPrismaService.stigFinding.groupBy.mockResolvedValue([
        { controlId: 'AC-1' },
        { controlId: 'AC-2' },
      ]);
      mockPrismaService.controlSystemStatus.findMany.mockResolvedValue(systemAssessments);
      mockPrismaService.nistControl.update.mockResolvedValue({});
      mockPrismaService.cciControlMapping.updateMany.mockResolvedValue({});

      await service.updateControlComplianceFromStigFindings();

      expect(prisma.nistControl.update).toHaveBeenCalled();
    });
  });

  describe('getSystemControlAssessments', () => {
    it('should retrieve system control assessments', async () => {
      const assessments = [
        {
          systemId: 1,
          controlId: 'AC-1',
          hasFindings: true,
          openCount: 2,
          criticalCount: 1,
          totalFindings: 10,
        },
      ];

      mockPrismaService.controlSystemStatus.findMany.mockResolvedValue(assessments);

      const result = await service.getSystemControlAssessments('AC-1');

      expect(result).toBeInstanceOf(Array);
      expect(prisma.controlSystemStatus.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { controlId: 'AC-1' },
        })
      );
    });
  });

  describe('compliance status determination', () => {
    it('should determine NOT_ASSESSED status when no findings reviewed', async () => {
      const systemAssessments = [
        {
          systemId: 1,
          controlId: 'AC-3',
          hasFindings: true,
          openCount: 0,
          criticalCount: 0,
          totalFindings: 5,
          complianceScore: 0,
          lastAssessed: new Date(),
        },
      ];

      mockPrismaService.controlSystemStatus.findMany.mockResolvedValue(systemAssessments);
      mockPrismaService.stigFinding.findMany.mockResolvedValue([
        { id: 1, status: 'Not_Reviewed', severity: 'CAT_I' },
        { id: 2, status: 'Not_Reviewed', severity: 'CAT_II' },
      ]);

      const result = await service.calculateControlComplianceScore('AC-3');

      expect(result?.complianceStatus).toBeDefined();
    });

    it('should determine compliant status when all findings resolved', async () => {
      const systemAssessments = [
        {
          systemId: 1,
          controlId: 'AC-4',
          hasFindings: true,
          openCount: 0,
          criticalCount: 0,
          totalFindings: 5,
          complianceScore: 100,
          lastAssessed: new Date(),
        },
      ];

      mockPrismaService.controlSystemStatus.findMany.mockResolvedValue(systemAssessments);
      mockPrismaService.stigFinding.findMany.mockResolvedValue([
        { id: 1, status: 'Not_a_Finding', severity: 'CAT_I' },
        { id: 2, status: 'Not_Applicable', severity: 'CAT_II' },
      ]);

      const result = await service.calculateControlComplianceScore('AC-4');

      expect(result?.openFindings).toBe(0);
    });
  });

  describe('aggregation across systems', () => {
    it('should aggregate findings from multiple systems', async () => {
      const systemAssessments = [
        {
          systemId: 1,
          controlId: 'AC-5',
          hasFindings: true,
          openCount: 2,
          criticalCount: 1,
          totalFindings: 10,
          complianceScore: 80,
          lastAssessed: new Date(),
        },
        {
          systemId: 2,
          controlId: 'AC-5',
          hasFindings: true,
          openCount: 1,
          criticalCount: 0,
          totalFindings: 5,
          complianceScore: 80,
          lastAssessed: new Date(),
        },
      ];

      mockPrismaService.controlSystemStatus.findMany.mockResolvedValue(systemAssessments);
      mockPrismaService.stigFinding.count.mockResolvedValue(15);
      mockPrismaService.stigFinding.findMany.mockResolvedValue([
        { id: 1, status: 'Open', severity: 'CAT_I', systemId: 1 },
        { id: 2, status: 'Open', severity: 'CAT_II', systemId: 2 },
      ]);
      mockPrismaService.system.count.mockResolvedValue(10);

      const result = await service.calculateControlComplianceScore('AC-5');

      expect(result?.systemsAssessed).toBe(2);
      expect(result?.totalSystems).toBe(10);
    });
  });

  describe('error handling', () => {
    it('should handle database errors gracefully', async () => {
      mockPrismaService.controlSystemStatus.findMany.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(
        service.calculateControlComplianceScore('AC-1'),
      ).rejects.toThrow('Database error');
    });

    it('should skip controls with no findings', async () => {
      mockPrismaService.controlSystemStatus.findMany.mockResolvedValue([]);
      mockPrismaService.nistControl.update.mockResolvedValue({});

      await service.updateControlComplianceFromStigFindings('AC-99');

      expect(prisma.nistControl.update).not.toHaveBeenCalled();
    });
  });
});
