import { Test, TestingModule } from '@nestjs/testing';
import { ReportProcessor } from './report.processor';
import { PrismaService } from '../../prisma/prisma.service';
import { Job } from 'bullmq';

describe('ReportProcessor', () => {
  let processor: ReportProcessor;
  let prisma: PrismaService;

  const mockPrismaService = {
    poam: {
      findMany: jest.fn(),
    },
    nessusVulnerability: {
      findMany: jest.fn(),
    },
    system: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportProcessor,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    processor = module.get<ReportProcessor>(ReportProcessor);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(processor).toBeDefined();
  });

  describe('process', () => {
    it('should process generate-report job for POAM', async () => {
      const mockPoams = [
        { id: 1, title: 'POAM 1', status: 'Open' },
        { id: 2, title: 'POAM 2', status: 'Closed' },
      ];

      mockPrismaService.poam.findMany.mockResolvedValue(mockPoams);

      const job = {
        id: '123',
        name: 'generate-report',
        data: {
          type: 'poam',
          format: 'pdf',
          filters: { status: 'Open' },
          userId: '1',
        },
      } as Job;

      const result = await processor.process(job);

      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('reportUrl');
      expect(result).toHaveProperty('generatedAt');
      expect(result).toHaveProperty('recordCount', 2);
      expect(prisma.poam.findMany).toHaveBeenCalled();
    });

    it('should process generate-report job for vulnerability', async () => {
      const mockVulns = [
        { id: 1, severity: 'High' },
        { id: 2, severity: 'Medium' },
      ];

      mockPrismaService.nessusVulnerability.findMany.mockResolvedValue(mockVulns);

      const job = {
        id: '124',
        name: 'generate-report',
        data: {
          type: 'vulnerability',
          format: 'excel',
          filters: {},
          userId: '1',
        },
      } as Job;

      const result = await processor.process(job);

      expect(result.success).toBe(true);
      expect(result.recordCount).toBe(2);
      expect(prisma.nessusVulnerability.findMany).toHaveBeenCalled();
    });

    it('should process generate-report job for system', async () => {
      const mockSystems = [
        { id: 1, name: 'System 1' },
        { id: 2, name: 'System 2' },
      ];

      mockPrismaService.system.findMany.mockResolvedValue(mockSystems);

      const job = {
        id: '125',
        name: 'generate-report',
        data: {
          type: 'system',
          format: 'csv',
          filters: {},
          userId: '1',
        },
      } as Job;

      const result = await processor.process(job);

      expect(result.success).toBe(true);
      expect(result.recordCount).toBe(2);
      expect(prisma.system.findMany).toHaveBeenCalled();
    });

    it('should process generate-report job for compliance', async () => {
      const job = {
        id: '126',
        name: 'generate-report',
        data: {
          type: 'compliance',
          format: 'pdf',
          filters: {},
          userId: '1',
        },
      } as Job;

      const result = await processor.process(job);

      expect(result.success).toBe(true);
      expect(result.recordCount).toBe(0); // Compliance report returns empty array
    });

    it('should process schedule-report job', async () => {
      const job = {
        id: '127',
        name: 'schedule-report',
        data: {
          type: 'poam',
          format: 'pdf',
          schedule: 'weekly',
        },
      } as Job;

      const result = await processor.process(job);

      expect(result).toHaveProperty('success', true);
    });

    it('should throw error for unknown job type', async () => {
      const job = {
        id: '128',
        name: 'unknown-job',
        data: {},
      } as Job;

      await expect(processor.process(job)).rejects.toThrow('Unknown job type: unknown-job');
    });
  });

  describe('generatePoamReport', () => {
    it('should generate POAM report with filters', async () => {
      const mockPoams = [
        {
          id: 1,
          title: 'Security Finding',
          status: 'Open',
          milestones: [],
          package: { name: 'Package 1' },
        },
      ];

      mockPrismaService.poam.findMany.mockResolvedValue(mockPoams);

      const job = {
        id: '129',
        name: 'generate-report',
        data: {
          type: 'poam',
          format: 'excel',
          filters: { status: 'Open', packageId: 1 },
          userId: '1',
        },
      } as Job;

      const result = await processor.process(job);

      expect(result.success).toBe(true);
      expect(prisma.poam.findMany).toHaveBeenCalledWith({
        where: { status: 'Open', packageId: 1 },
        include: expect.objectContaining({
          milestones: true,
          package: true,
          group: true,
        }),
      });
    });
  });

  describe('report formats', () => {
    it('should support PDF format', async () => {
      mockPrismaService.poam.findMany.mockResolvedValue([]);

      const job = {
        id: '130',
        name: 'generate-report',
        data: {
          type: 'poam',
          format: 'pdf',
          filters: {},
          userId: '1',
        },
      } as Job;

      const result = await processor.process(job);

      expect(result.reportUrl).toContain('.pdf');
    });

    it('should support Excel format', async () => {
      mockPrismaService.poam.findMany.mockResolvedValue([]);

      const job = {
        id: '131',
        name: 'generate-report',
        data: {
          type: 'poam',
          format: 'excel',
          filters: {},
          userId: '1',
        },
      } as Job;

      const result = await processor.process(job);

      expect(result.reportUrl).toContain('.excel');
    });

    it('should support CSV format', async () => {
      mockPrismaService.poam.findMany.mockResolvedValue([]);

      const job = {
        id: '132',
        name: 'generate-report',
        data: {
          type: 'poam',
          format: 'csv',
          filters: {},
          userId: '1',
        },
      } as Job;

      const result = await processor.process(job);

      expect(result.reportUrl).toContain('.csv');
    });
  });

  describe('error handling', () => {
    it('should handle database errors', async () => {
      mockPrismaService.poam.findMany.mockRejectedValue(new Error('Database error'));

      const job = {
        id: '133',
        name: 'generate-report',
        data: {
          type: 'poam',
          format: 'pdf',
          filters: {},
          userId: '1',
        },
      } as Job;

      await expect(processor.process(job)).rejects.toThrow('Database error');
    });
  });
});
