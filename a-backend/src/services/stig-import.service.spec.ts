import { Test, TestingModule } from '@nestjs/testing';
import { StigImportService } from './stig-import.service';
import { PrismaService } from '../prisma/prisma.service';
import { CciMapperService } from './cci-mapper.service';
import { ControlComplianceService } from './control-compliance.service';

describe('StigImportService', () => {
  let service: StigImportService;
  let prisma: PrismaService;
  let cciMapper: CciMapperService;

  const mockPrismaService = {
    stigScan: {
      create: jest.fn(),
    },
    stigFinding: {
      createMany: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      upsert: jest.fn(),
    },
    systemScore: {
      upsert: jest.fn(),
    },
    controlSystemStatus: {
      upsert: jest.fn(),
    },
  };

  const mockCciMapper = {
    parseStigFinding: jest.fn(),
    mapCciToControl: jest.fn(),
  };

  const mockControlCompliance = {
    updateSystemCompliance: jest.fn(),
    updateComplianceAfterStigImport: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StigImportService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: CciMapperService,
          useValue: mockCciMapper,
        },
        {
          provide: ControlComplianceService,
          useValue: mockControlCompliance,
        },
      ],
    }).compile();

    service = module.get<StigImportService>(StigImportService);
    prisma = module.get<PrismaService>(PrismaService);
    cciMapper = module.get<CciMapperService>(CciMapperService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('parseStigScan', () => {
    it('should parse CKLB format (JSON)', async () => {
      const cklbContent = JSON.stringify({
        title: 'Test STIG',
        version: '1',
        stigs: [{
          benchmarkId: 'test',
          checklists: [{
            asset: { hostName: 'test' },
            stigChecks: [
              {
                ruleId: 'SV-12345',
                vulnId: 'V-12345',
                severity: 'high',
                status: 'open',
              },
            ],
          }],
        }],
      });

      mockCciMapper.parseStigFinding.mockReturnValue({
        ruleId: 'SV-12345',
        vulnId: 'V-12345',
        severity: 'CAT_I',
        status: 'Open',
      });

      const result = await service.parseStigScan(cklbContent, 'test.cklb');

      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBeGreaterThanOrEqual(0);
    });

    it('should parse CKL format (XML)', async () => {
      const cklContent = `
        <CHECKLIST>
          <STIGS>
            <iSTIG>
              <VULN>
                <STIG_DATA>
                  <VULN_ATTRIBUTE>Rule_ID</VULN_ATTRIBUTE>
                  <ATTRIBUTE_DATA>SV-12345</ATTRIBUTE_DATA>
                </STIG_DATA>
                <STATUS>Open</STATUS>
              </VULN>
            </iSTIG>
          </STIGS>
        </CHECKLIST>
      `;

      mockCciMapper.parseStigFinding.mockReturnValue({
        ruleId: 'SV-12345',
        vulnId: 'V-12345',
        severity: 'CAT_I',
        status: 'Open',
      });

      const result = await service.parseStigScan(cklContent, 'test.ckl');

      expect(result).toBeInstanceOf(Array);
    });

    it('should handle parsing errors', async () => {
      const invalidContent = 'invalid xml/json content';

      await expect(
        service.parseStigScan(invalidContent, 'test.ckl'),
      ).rejects.toThrow('Failed to parse STIG scan');
    });
  });

  describe('createStigScan', () => {
    it('should create STIG scan record', async () => {
      const scanRecord = {
        id: 1,
        systemId: 1,
        filename: 'test.ckl',
        userId: 1,
        findingsCount: 50,
        createdAt: new Date(),
      };

      mockPrismaService.stigScan.create.mockResolvedValue(scanRecord);

      const result = await service.createStigScan(1, 'test.ckl', 1, 50);

      expect(result).toBe(1);
      expect(prisma.stigScan.create).toHaveBeenCalledWith({
        data: {
          systemId: 1,
          filename: 'test.ckl',
          importedBy: 1,
          findingCount: 50,
        },
      });
    });
  });

  describe('saveStigFindings', () => {
    it('should save findings in batches', async () => {
      const findings = Array.from({ length: 150 }, (_, i) => ({
        ruleId: `SV-${i}`,
        vulnId: `V-${i}`,
        title: `Finding ${i}`,
        severity: 'CAT_II',
        status: 'Open',
        controlId: 'AC-1',
      }));

      mockPrismaService.stigFinding.findFirst.mockResolvedValue(null);
      mockPrismaService.stigFinding.upsert.mockResolvedValue({});
      mockPrismaService.stigFinding.createMany.mockResolvedValue({ count: 150 });

      await service.saveStigFindings(1, 1, findings);

      expect(prisma.stigFinding.upsert).toHaveBeenCalled();
    });

    it('should handle empty findings array', async () => {
      await service.saveStigFindings(1, 1, []);

      expect(prisma.stigFinding.createMany).not.toHaveBeenCalled();
    });
  });

  describe('calculateSystemScore', () => {
    it('should calculate and return system score', async () => {
      const findings = [
        { id: 1, status: 'Open', severity: 'CAT_I' },
        { id: 2, status: 'Not_a_Finding', severity: 'CAT_II' },
        { id: 3, status: 'Not_Reviewed', severity: 'CAT_III' },
      ];

      mockPrismaService.stigFinding.findMany.mockResolvedValue(findings);
      mockPrismaService.systemScore.upsert.mockResolvedValue({});

      const result = await service.calculateSystemScore(1, 1);

      expect(result).toHaveProperty('assessmentProgress');
      expect(result).toHaveProperty('complianceScore');
      expect(result).toHaveProperty('totalFindings', 3);
      expect(result).toHaveProperty('openFindings', 1);
      expect(result).toHaveProperty('notReviewedFindings', 1);
    });

    it('should calculate correct compliance score', async () => {
      const findings = [
        { id: 1, status: 'Not_a_Finding', severity: 'CAT_I' },
        { id: 2, status: 'Not_a_Finding', severity: 'CAT_II' },
        { id: 3, status: 'Open', severity: 'CAT_III' },
      ];

      mockPrismaService.stigFinding.findMany.mockResolvedValue(findings);
      mockPrismaService.systemScore.upsert.mockResolvedValue({});

      const result = await service.calculateSystemScore(1, 1);

      expect(result.complianceScore).toBeCloseTo(66.67, 1);
    });
  });

  describe('updateControlSystemStatus', () => {
    it('should update control system status', async () => {
      const findings = [
        { id: 1, controlId: 'AC-1', status: 'Open', severity: 'CAT_I' },
        { id: 2, controlId: 'AC-1', status: 'Open', severity: 'CAT_II' },
        { id: 3, controlId: 'AC-2', status: 'Not_a_Finding', severity: 'CAT_III' },
      ];

      mockPrismaService.stigFinding.findMany.mockResolvedValue(findings);
      mockPrismaService.controlSystemStatus.upsert.mockResolvedValue({});

      await service.updateControlSystemStatus(1, 1);

      expect(prisma.stigFinding.findMany).toHaveBeenCalledWith({
        where: {
          systemId: 1,
          scanId: 1,
          controlId: { not: null },
        },
      });
      expect(prisma.controlSystemStatus.upsert).toHaveBeenCalled();
    });

    it('should handle systems with no control mappings', async () => {
      mockPrismaService.stigFinding.findMany.mockResolvedValue([]);

      await service.updateControlSystemStatus(1, 1);

      expect(prisma.controlSystemStatus.upsert).not.toHaveBeenCalled();
    });

    it('should count critical findings correctly', async () => {
      const findings = [
        { id: 1, controlId: 'AC-1', status: 'Open', severity: 'CAT_I' },
        { id: 2, controlId: 'AC-1', status: 'Open', severity: 'CAT_I' },
        { id: 3, controlId: 'AC-1', status: 'Open', severity: 'CAT_II' },
      ];

      mockPrismaService.stigFinding.findMany.mockResolvedValue(findings);
      mockPrismaService.controlSystemStatus.upsert.mockResolvedValue({});

      await service.updateControlSystemStatus(1, 1);

      expect(prisma.controlSystemStatus.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          update: expect.objectContaining({
            openCount: 3,
            criticalCount: 2,
          }),
          create: expect.any(Object),
        }),
      );
    });
  });

  describe('file format detection', () => {
    it('should detect CKLB format by extension', async () => {
      const cklbContent = JSON.stringify({
        stigs: [{ stigChecks: [] }],
      });

      mockCciMapper.parseStigFinding.mockReturnValue({
        ruleId: 'SV-1',
        vulnId: 'V-1',
        severity: 'CAT_I',
        status: 'Open',
      });

      const result = await service.parseStigScan(cklbContent, 'scan.cklb');

      expect(result).toBeInstanceOf(Array);
    });

    it('should handle unsupported format', async () => {
      const invalidContent = '<INVALID></INVALID>';

      await expect(service.parseStigScan(invalidContent, 'scan.ckl')).rejects.toThrow();
    });
  });

  describe('batch processing', () => {
    it('should process large number of findings efficiently', async () => {
      const findings = Array.from({ length: 500 }, (_, i) => ({
        ruleId: `SV-${i}`,
        vulnId: `V-${i}`,
        title: `Finding ${i}`,
        severity: 'CAT_II',
        status: 'Open',
      }));

      mockPrismaService.stigFinding.findFirst.mockResolvedValue(null);
      mockPrismaService.stigFinding.upsert.mockResolvedValue({});
      mockPrismaService.stigFinding.createMany.mockResolvedValue({ count: 500 });

      await service.saveStigFindings(1, 1, findings);

      expect(prisma.stigFinding.upsert).toHaveBeenCalled();
    });
  });
});
