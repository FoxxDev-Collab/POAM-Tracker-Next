import { Test, TestingModule } from '@nestjs/testing';
import { StigImportProcessor } from './stig-import.processor';
import { PrismaService } from '../../prisma/prisma.service';
import { CciMapperService } from '../../services/cci-mapper.service';
import { StigImportService } from '../../services/stig-import.service';
import { ScoringService } from '../../services/scoring.service';
import { Job } from 'bullmq';

describe('StigImportProcessor', () => {
  let processor: StigImportProcessor;
  let prisma: PrismaService;
  let stigImportService: StigImportService;
  let scoringService: ScoringService;

  const mockPrismaService = {
    system: {
      findUnique: jest.fn(),
    },
  };

  const mockCciMapper = {
    mapCciToControl: jest.fn(),
  };

  const mockStigImportService = {
    parseStigScan: jest.fn(),
    createStigScan: jest.fn(),
    saveStigFindings: jest.fn(),
    calculateSystemScore: jest.fn(),
    updateControlSystemStatus: jest.fn(),
  };

  const mockScoringService = {
    calculateGroupScore: jest.fn(),
    updateControlGroupStatus: jest.fn(),
    calculatePackageScore: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StigImportProcessor,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: CciMapperService,
          useValue: mockCciMapper,
        },
        {
          provide: StigImportService,
          useValue: mockStigImportService,
        },
        {
          provide: ScoringService,
          useValue: mockScoringService,
        },
      ],
    }).compile();

    processor = module.get<StigImportProcessor>(StigImportProcessor);
    prisma = module.get<PrismaService>(PrismaService);
    stigImportService = module.get<StigImportService>(StigImportService);
    scoringService = module.get<ScoringService>(ScoringService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(processor).toBeDefined();
  });

  describe('process', () => {
    it('should successfully process STIG import', async () => {
      const findings = [
        { ruleId: 'SV-12345', status: 'Open', severity: 'CAT_I', controlId: 'AC-1' },
        { ruleId: 'SV-12346', status: 'Not_Reviewed', severity: 'CAT_II', controlId: 'AC-2' },
        { ruleId: 'SV-12347', status: 'Open', severity: 'CAT_III', controlId: null },
      ];

      const scores = {
        overallScore: 85.5,
        catICount: 1,
        catIICount: 1,
        catIIICount: 1,
      };

      mockStigImportService.parseStigScan.mockResolvedValue(findings);
      mockStigImportService.createStigScan.mockResolvedValue(1);
      mockStigImportService.saveStigFindings.mockResolvedValue(undefined);
      mockStigImportService.calculateSystemScore.mockResolvedValue(scores);
      mockStigImportService.updateControlSystemStatus.mockResolvedValue(undefined);
      mockPrismaService.system.findUnique.mockResolvedValue({
        id: 1,
        groupId: 1,
        packageId: 1,
      });
      mockScoringService.calculateGroupScore.mockResolvedValue(undefined);
      mockScoringService.updateControlGroupStatus.mockResolvedValue(undefined);
      mockScoringService.calculatePackageScore.mockResolvedValue(undefined);

      const job = {
        id: '123',
        data: {
          systemId: 1,
          filename: 'stig-scan.xml',
          fileContent: '<STIG>...</STIG>',
          userId: 1,
        },
        updateProgress: jest.fn(),
      } as unknown as Job;

      const result = await processor.process(job);

      expect(result).toHaveProperty('scanId', 1);
      expect(result).toHaveProperty('totalFindings', 3);
      expect(result).toHaveProperty('mappedControls', 2);
      expect(result).toHaveProperty('openFindings', 2);
      expect(result).toHaveProperty('notReviewedFindings', 1);
      expect(result).toHaveProperty('scores');
      expect(job.updateProgress).toHaveBeenCalledWith(100);
    });

    it('should update progress during import', async () => {
      const findings = [{ ruleId: 'SV-12345', status: 'Open', controlId: 'AC-1' }];

      mockStigImportService.parseStigScan.mockResolvedValue(findings);
      mockStigImportService.createStigScan.mockResolvedValue(1);
      mockStigImportService.saveStigFindings.mockResolvedValue(undefined);
      mockStigImportService.calculateSystemScore.mockResolvedValue({});
      mockStigImportService.updateControlSystemStatus.mockResolvedValue(undefined);
      mockPrismaService.system.findUnique.mockResolvedValue({
        id: 1,
        groupId: 1,
        packageId: 1,
      });
      mockScoringService.calculateGroupScore.mockResolvedValue(undefined);
      mockScoringService.updateControlGroupStatus.mockResolvedValue(undefined);
      mockScoringService.calculatePackageScore.mockResolvedValue(undefined);

      const job = {
        id: '124',
        data: {
          systemId: 1,
          filename: 'test.xml',
          fileContent: '<STIG></STIG>',
          userId: 1,
        },
        updateProgress: jest.fn(),
      } as unknown as Job;

      await processor.process(job);

      expect(job.updateProgress).toHaveBeenCalledWith(20);
      expect(job.updateProgress).toHaveBeenCalledWith(30);
      expect(job.updateProgress).toHaveBeenCalledWith(70);
      expect(job.updateProgress).toHaveBeenCalledWith(90);
      expect(job.updateProgress).toHaveBeenCalledWith(95);
      expect(job.updateProgress).toHaveBeenCalledWith(100);
    });

    it('should calculate group scores when system has groupId', async () => {
      const findings = [{ ruleId: 'SV-12345', status: 'Open', controlId: 'AC-1' }];

      mockStigImportService.parseStigScan.mockResolvedValue(findings);
      mockStigImportService.createStigScan.mockResolvedValue(1);
      mockStigImportService.saveStigFindings.mockResolvedValue(undefined);
      mockStigImportService.calculateSystemScore.mockResolvedValue({});
      mockStigImportService.updateControlSystemStatus.mockResolvedValue(undefined);
      mockPrismaService.system.findUnique.mockResolvedValue({
        id: 1,
        groupId: 2,
        packageId: null,
      });
      mockScoringService.calculateGroupScore.mockResolvedValue(undefined);
      mockScoringService.updateControlGroupStatus.mockResolvedValue(undefined);

      const job = {
        id: '125',
        data: {
          systemId: 1,
          filename: 'test.xml',
          fileContent: '<STIG></STIG>',
          userId: 1,
        },
        updateProgress: jest.fn(),
      } as unknown as Job;

      await processor.process(job);

      expect(scoringService.calculateGroupScore).toHaveBeenCalledWith(2);
      expect(scoringService.updateControlGroupStatus).toHaveBeenCalledWith(2);
    });

    it('should calculate package scores when system has packageId', async () => {
      const findings = [{ ruleId: 'SV-12345', status: 'Open', controlId: 'AC-1' }];

      mockStigImportService.parseStigScan.mockResolvedValue(findings);
      mockStigImportService.createStigScan.mockResolvedValue(1);
      mockStigImportService.saveStigFindings.mockResolvedValue(undefined);
      mockStigImportService.calculateSystemScore.mockResolvedValue({});
      mockStigImportService.updateControlSystemStatus.mockResolvedValue(undefined);
      mockPrismaService.system.findUnique.mockResolvedValue({
        id: 1,
        groupId: null,
        packageId: 3,
      });
      mockScoringService.calculatePackageScore.mockResolvedValue(undefined);

      const job = {
        id: '126',
        data: {
          systemId: 1,
          filename: 'test.xml',
          fileContent: '<STIG></STIG>',
          userId: 1,
        },
        updateProgress: jest.fn(),
      } as unknown as Job;

      await processor.process(job);

      expect(scoringService.calculatePackageScore).toHaveBeenCalledWith(3);
    });

    it('should handle errors during import', async () => {
      mockStigImportService.parseStigScan.mockRejectedValue(
        new Error('Parse error'),
      );

      const job = {
        id: '127',
        data: {
          systemId: 1,
          filename: 'test.xml',
          fileContent: '<INVALID></INVALID>',
          userId: 1,
        },
        updateProgress: jest.fn(),
      } as unknown as Job;

      await expect(processor.process(job)).rejects.toThrow('STIG import failed: Parse error');
    });

    it('should count findings by status correctly', async () => {
      const findings = [
        { ruleId: 'SV-1', status: 'Open', controlId: 'AC-1' },
        { ruleId: 'SV-2', status: 'Open', controlId: 'AC-2' },
        { ruleId: 'SV-3', status: 'Not_Reviewed', controlId: 'AC-3' },
        { ruleId: 'SV-4', status: 'NotAFinding', controlId: 'AC-4' },
      ];

      mockStigImportService.parseStigScan.mockResolvedValue(findings);
      mockStigImportService.createStigScan.mockResolvedValue(1);
      mockStigImportService.saveStigFindings.mockResolvedValue(undefined);
      mockStigImportService.calculateSystemScore.mockResolvedValue({});
      mockStigImportService.updateControlSystemStatus.mockResolvedValue(undefined);
      mockPrismaService.system.findUnique.mockResolvedValue({ id: 1 });

      const job = {
        id: '128',
        data: {
          systemId: 1,
          filename: 'test.xml',
          fileContent: '<STIG></STIG>',
          userId: 1,
        },
        updateProgress: jest.fn(),
      } as unknown as Job;

      const result = await processor.process(job);

      expect(result.openFindings).toBe(2);
      expect(result.notReviewedFindings).toBe(1);
    });

    it('should count mapped controls correctly', async () => {
      const findings = [
        { ruleId: 'SV-1', status: 'Open', controlId: 'AC-1' },
        { ruleId: 'SV-2', status: 'Open', controlId: 'AC-2' },
        { ruleId: 'SV-3', status: 'Open', controlId: null },
      ];

      mockStigImportService.parseStigScan.mockResolvedValue(findings);
      mockStigImportService.createStigScan.mockResolvedValue(1);
      mockStigImportService.saveStigFindings.mockResolvedValue(undefined);
      mockStigImportService.calculateSystemScore.mockResolvedValue({});
      mockStigImportService.updateControlSystemStatus.mockResolvedValue(undefined);
      mockPrismaService.system.findUnique.mockResolvedValue({ id: 1 });

      const job = {
        id: '129',
        data: {
          systemId: 1,
          filename: 'test.xml',
          fileContent: '<STIG></STIG>',
          userId: 1,
        },
        updateProgress: jest.fn(),
      } as unknown as Job;

      const result = await processor.process(job);

      expect(result.mappedControls).toBe(2);
    });
  });
});
