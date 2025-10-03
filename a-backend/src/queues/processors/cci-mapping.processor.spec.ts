import { Test, TestingModule } from '@nestjs/testing';
import { CciMappingProcessor } from './cci-mapping.processor';
import { PrismaService } from '../../prisma/prisma.service';
import { CciMapperService } from '../../services/cci-mapper.service';
import { Job } from 'bullmq';

describe('CciMappingProcessor', () => {
  let processor: CciMappingProcessor;
  let prisma: PrismaService;
  let cciMapper: CciMapperService;

  const mockPrismaService = {
    stigFinding: {
      findMany: jest.fn(),
      update: jest.fn(),
    },
    controlSystemStatus: {
      upsert: jest.fn(),
    },
  };

  const mockCciMapper = {
    mapCciToControl: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CciMappingProcessor,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: CciMapperService,
          useValue: mockCciMapper,
        },
      ],
    }).compile();

    processor = module.get<CciMappingProcessor>(CciMappingProcessor);
    prisma = module.get<PrismaService>(PrismaService);
    cciMapper = module.get<CciMapperService>(CciMapperService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(processor).toBeDefined();
  });

  describe('process', () => {
    it('should map CCI to controls successfully', async () => {
      const findings = [
        { id: 1, cci: 'CCI-000001', controlId: null, status: 'Open', severity: 'CAT_I' },
        { id: 2, cci: 'CCI-000002', controlId: null, status: 'Open', severity: 'CAT_II' },
      ];

      mockPrismaService.stigFinding.findMany
        .mockResolvedValueOnce(findings) // First call for unmapped findings
        .mockResolvedValueOnce(findings); // Second call for control system status

      mockCciMapper.mapCciToControl
        .mockReturnValueOnce('AC-1')
        .mockReturnValueOnce('AC-2');

      mockPrismaService.stigFinding.update.mockResolvedValue({});
      mockPrismaService.controlSystemStatus.upsert.mockResolvedValue({});

      const job = {
        id: '123',
        data: {
          scanId: 1,
          systemId: 1,
        },
        updateProgress: jest.fn(),
      } as unknown as Job;

      const result = await processor.process(job);

      expect(result).toHaveProperty('totalFindings', 2);
      expect(result).toHaveProperty('mappedCount', 2);
      expect(cciMapper.mapCciToControl).toHaveBeenCalledTimes(2);
      expect(prisma.stigFinding.update).toHaveBeenCalledTimes(2);
    });

    it('should return early when no findings to map', async () => {
      mockPrismaService.stigFinding.findMany.mockResolvedValue([]);

      const job = {
        id: '124',
        data: {
          scanId: 1,
          systemId: 1,
        },
        updateProgress: jest.fn(),
      } as unknown as Job;

      const result = await processor.process(job);

      expect(result).toEqual({ mappedCount: 0 });
      expect(cciMapper.mapCciToControl).not.toHaveBeenCalled();
    });

    it('should skip findings with no CCI mapping', async () => {
      const findings = [
        { id: 1, cci: 'CCI-000001', controlId: null },
        { id: 2, cci: 'CCI-000002', controlId: null },
      ];

      mockPrismaService.stigFinding.findMany
        .mockResolvedValueOnce(findings)
        .mockResolvedValueOnce([]);

      mockCciMapper.mapCciToControl
        .mockReturnValueOnce('AC-1')
        .mockReturnValueOnce(null); // No mapping for second CCI

      mockPrismaService.stigFinding.update.mockResolvedValue({});

      const job = {
        id: '125',
        data: {
          scanId: 1,
          systemId: 1,
        },
        updateProgress: jest.fn(),
      } as unknown as Job;

      const result = await processor.process(job);

      expect(result.mappedCount).toBe(1);
      expect(prisma.stigFinding.update).toHaveBeenCalledTimes(1);
    });

    it('should process findings in batches', async () => {
      const findings = Array.from({ length: 100 }, (_, i) => ({
        id: i + 1,
        cci: `CCI-00000${i + 1}`,
        controlId: null,
      }));

      mockPrismaService.stigFinding.findMany
        .mockResolvedValueOnce(findings)
        .mockResolvedValueOnce([]);

      mockCciMapper.mapCciToControl.mockReturnValue('AC-1');
      mockPrismaService.stigFinding.update.mockResolvedValue({});

      const job = {
        id: '126',
        data: {
          scanId: 1,
          systemId: 1,
        },
        updateProgress: jest.fn(),
      } as unknown as Job;

      const result = await processor.process(job);

      expect(result.mappedCount).toBe(100);
      expect(job.updateProgress).toHaveBeenCalled();
    });

    it('should update progress during mapping', async () => {
      const findings = Array.from({ length: 100 }, (_, i) => ({
        id: i + 1,
        cci: `CCI-00000${i + 1}`,
        controlId: null,
      }));

      mockPrismaService.stigFinding.findMany
        .mockResolvedValueOnce(findings)
        .mockResolvedValueOnce([]);

      mockCciMapper.mapCciToControl.mockReturnValue('AC-1');
      mockPrismaService.stigFinding.update.mockResolvedValue({});

      const job = {
        id: '127',
        data: {
          scanId: 1,
          systemId: 1,
        },
        updateProgress: jest.fn(),
      } as unknown as Job;

      await processor.process(job);

      expect(job.updateProgress).toHaveBeenCalledWith(expect.any(Number));
    });

    it('should update control system status after mapping', async () => {
      const findings = [
        { id: 1, cci: 'CCI-000001', controlId: null, status: 'Open', severity: 'CAT_I' },
      ];

      const mappedFindings = [
        { id: 1, controlId: 'AC-1', status: 'Open', severity: 'CAT_I' },
      ];

      mockPrismaService.stigFinding.findMany
        .mockResolvedValueOnce(findings)
        .mockResolvedValueOnce(mappedFindings);

      mockCciMapper.mapCciToControl.mockReturnValue('AC-1');
      mockPrismaService.stigFinding.update.mockResolvedValue({});
      mockPrismaService.controlSystemStatus.upsert.mockResolvedValue({});

      const job = {
        id: '128',
        data: {
          scanId: 1,
          systemId: 1,
        },
        updateProgress: jest.fn(),
      } as unknown as Job;

      await processor.process(job);

      expect(prisma.controlSystemStatus.upsert).toHaveBeenCalledWith({
        where: {
          controlId_systemId: {
            controlId: 'AC-1',
            systemId: 1,
          },
        },
        update: expect.objectContaining({
          hasFindings: true,
          openCount: 1,
          criticalCount: 1,
        }),
        create: expect.objectContaining({
          controlId: 'AC-1',
          systemId: 1,
          hasFindings: true,
          openCount: 1,
          criticalCount: 1,
        }),
      });
    });

    it('should handle errors during mapping', async () => {
      mockPrismaService.stigFinding.findMany.mockRejectedValue(
        new Error('Database error'),
      );

      const job = {
        id: '129',
        data: {
          scanId: 1,
          systemId: 1,
        },
        updateProgress: jest.fn(),
      } as unknown as Job;

      await expect(processor.process(job)).rejects.toThrow('CCI mapping failed: Database error');
    });

    it('should calculate control status correctly', async () => {
      const findings = [
        { id: 1, cci: 'CCI-000001', controlId: null },
      ];

      const mappedFindings = [
        { id: 1, controlId: 'AC-1', status: 'Open', severity: 'CAT_I' },
        { id: 2, controlId: 'AC-1', status: 'Open', severity: 'CAT_II' },
        { id: 3, controlId: 'AC-1', status: 'NotAFinding', severity: 'CAT_III' },
      ];

      mockPrismaService.stigFinding.findMany
        .mockResolvedValueOnce(findings)
        .mockResolvedValueOnce(mappedFindings);

      mockCciMapper.mapCciToControl.mockReturnValue('AC-1');
      mockPrismaService.stigFinding.update.mockResolvedValue({});
      mockPrismaService.controlSystemStatus.upsert.mockResolvedValue({});

      const job = {
        id: '130',
        data: {
          scanId: 1,
          systemId: 1,
        },
        updateProgress: jest.fn(),
      } as unknown as Job;

      await processor.process(job);

      expect(prisma.controlSystemStatus.upsert).toHaveBeenCalledWith({
        where: {
          controlId_systemId: {
            controlId: 'AC-1',
            systemId: 1,
          },
        },
        update: expect.objectContaining({
          openCount: 2,
          criticalCount: 1,
        }),
        create: expect.any(Object),
      });
    });
  });
});
