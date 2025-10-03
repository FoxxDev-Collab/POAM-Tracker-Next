import { Test, TestingModule } from '@nestjs/testing';
import { CciMapperService } from './cci-mapper.service';
import { PrismaService } from '../prisma/prisma.service';

describe('CciMapperService', () => {
  let service: CciMapperService;
  let prisma: PrismaService;

  const mockPrismaService = {
    cciControlMapping: {
      count: jest.fn(),
      findMany: jest.fn(),
      createMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CciMapperService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<CciMapperService>(CciMapperService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('loadCciMappings', () => {
    it('should load mappings from database when available', async () => {
      const mockMappings = [
        {
          cci: 'CCI-000001',
          definition: 'Test definition',
          controlId: 'AC-1',
          controlTitle: 'Access Control Policy',
        },
        {
          cci: 'CCI-000002',
          definition: 'Test definition 2',
          controlId: 'AC-2',
          controlTitle: 'Account Management',
        },
      ];

      mockPrismaService.cciControlMapping.count.mockResolvedValue(2);
      mockPrismaService.cciControlMapping.findMany.mockResolvedValue(mockMappings);

      await service.loadCciMappings();

      expect(prisma.cciControlMapping.count).toHaveBeenCalled();
      expect(prisma.cciControlMapping.findMany).toHaveBeenCalled();
    });

    it('should handle empty database', async () => {
      mockPrismaService.cciControlMapping.count.mockResolvedValue(0);

      await service.loadCciMappings();

      expect(prisma.cciControlMapping.count).toHaveBeenCalled();
    });

    it('should handle database errors', async () => {
      mockPrismaService.cciControlMapping.count.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(service.loadCciMappings()).rejects.toThrow('Database error');
    });
  });

  describe('mapCciToControl', () => {
    beforeEach(async () => {
      const mockMappings = [
        {
          cci: 'CCI-000001',
          definition: 'Test',
          controlId: 'AC-1',
          controlTitle: 'Access Control',
        },
      ];

      mockPrismaService.cciControlMapping.count.mockResolvedValue(1);
      mockPrismaService.cciControlMapping.findMany.mockResolvedValue(mockMappings);
      await service.loadCciMappings();
    });

    it('should map CCI to control ID', () => {
      const result = service.mapCciToControl('CCI-000001');

      expect(result).toBe('AC-1');
    });

    it('should return null for unknown CCI', () => {
      const result = service.mapCciToControl('CCI-999999');

      expect(result).toBeNull();
    });

    it('should normalize control ID', async () => {
      const mockMappings = [
        {
          cci: 'CCI-000002',
          definition: 'Test',
          controlId: 'AC-2 (1)',
          controlTitle: 'Test',
        },
      ];

      mockPrismaService.cciControlMapping.count.mockResolvedValue(1);
      mockPrismaService.cciControlMapping.findMany.mockResolvedValue(mockMappings);
      await service.loadCciMappings();

      const result = service.mapCciToControl('CCI-000002');

      expect(result).toContain('AC-2');
    });
  });

  describe('mapMultipleCcisToControl', () => {
    beforeEach(async () => {
      const mockMappings = [
        { cci: 'CCI-000001', definition: 'Test', controlId: 'AC-1', controlTitle: 'Test' },
        { cci: 'CCI-000002', definition: 'Test', controlId: 'AC-2', controlTitle: 'Test' },
        { cci: 'CCI-000003', definition: 'Test', controlId: 'AC-3', controlTitle: 'Test' },
      ];

      mockPrismaService.cciControlMapping.count.mockResolvedValue(3);
      mockPrismaService.cciControlMapping.findMany.mockResolvedValue(mockMappings);
      await service.loadCciMappings();
    });

    it('should map multiple CCIs to controls', () => {
      const ccis = ['CCI-000001', 'CCI-000002', 'CCI-000003'];
      const result = service.mapMultipleCcisToControl(ccis);

      expect(result.size).toBe(3);
      expect(result.get('CCI-000001')).toBe('AC-1');
      expect(result.get('CCI-000002')).toBe('AC-2');
      expect(result.get('CCI-000003')).toBe('AC-3');
    });

    it('should skip unknown CCIs', () => {
      const ccis = ['CCI-000001', 'CCI-999999', 'CCI-000002'];
      const result = service.mapMultipleCcisToControl(ccis);

      expect(result.size).toBe(2);
      expect(result.has('CCI-999999')).toBe(false);
    });

    it('should handle empty array', () => {
      const result = service.mapMultipleCcisToControl([]);

      expect(result.size).toBe(0);
    });
  });

  describe('getMapping', () => {
    beforeEach(async () => {
      const mockMappings = [
        {
          cci: 'CCI-000001',
          definition: 'Test definition',
          controlId: 'AC-1',
          controlTitle: 'Access Control',
        },
      ];

      mockPrismaService.cciControlMapping.count.mockResolvedValue(1);
      mockPrismaService.cciControlMapping.findMany.mockResolvedValue(mockMappings);
      await service.loadCciMappings();
    });

    it('should get full mapping details', () => {
      const result = service.getMapping('CCI-000001');

      expect(result).toHaveProperty('cci', 'CCI-000001');
      expect(result).toHaveProperty('controlId', 'AC-1');
      expect(result).toHaveProperty('definition');
    });

    it('should return null for unknown CCI', () => {
      const result = service.getMapping('CCI-999999');

      expect(result).toBeNull();
    });
  });

  describe('getAllMappings', () => {
    beforeEach(async () => {
      const mockMappings = [
        { cci: 'CCI-000001', definition: 'Test', controlId: 'AC-1', controlTitle: 'Test' },
        { cci: 'CCI-000002', definition: 'Test', controlId: 'AC-2', controlTitle: 'Test' },
      ];

      mockPrismaService.cciControlMapping.count.mockResolvedValue(2);
      mockPrismaService.cciControlMapping.findMany.mockResolvedValue(mockMappings);
      await service.loadCciMappings();
    });

    it('should return all mappings', () => {
      const result = service.getAllMappings();

      expect(result.size).toBe(2);
      expect(result.has('CCI-000001')).toBe(true);
      expect(result.has('CCI-000002')).toBe(true);
    });
  });

  describe('refreshMappings', () => {
    it('should reload mappings from database', async () => {
      const mockMappings = [
        { cci: 'CCI-000001', definition: 'Test', controlId: 'AC-1', controlTitle: 'Test' },
      ];

      mockPrismaService.cciControlMapping.count.mockResolvedValue(1);
      mockPrismaService.cciControlMapping.findMany.mockResolvedValue(mockMappings);

      await service.refreshMappings();

      expect(prisma.cciControlMapping.count).toHaveBeenCalled();
      expect(prisma.cciControlMapping.findMany).toHaveBeenCalled();
    });
  });

  describe('parseStigFinding', () => {
    beforeEach(async () => {
      const mockMappings = [
        { cci: 'CCI-000001', definition: 'Test', controlId: 'AC-1', controlTitle: 'Test' },
      ];

      mockPrismaService.cciControlMapping.count.mockResolvedValue(1);
      mockPrismaService.cciControlMapping.findMany.mockResolvedValue(mockMappings);
      await service.loadCciMappings();
    });

    it('should parse STIG finding with CCI mapping', () => {
      const finding = {
        rule_id: 'SV-12345r1_rule',
        vuln_id: 'V-12345',
        rule_title: 'Test Finding',
        severity: 'high',
        status: 'open',
        cci_ref: 'CCI-000001',
        vuln_discuss: 'Test description',
      };

      const result = service.parseStigFinding(finding);

      expect(result).toHaveProperty('ruleId', 'SV-12345r1_rule');
      expect(result).toHaveProperty('vulnId', 'V-12345');
      expect(result).toHaveProperty('severity', 'CAT_I');
      expect(result).toHaveProperty('status', 'Open');
      expect(result).toHaveProperty('controlId', 'AC-1');
    });

    it('should parse finding without CCI', () => {
      const finding = {
        rule_id: 'SV-12346r1_rule',
        vuln_id: 'V-12346',
        rule_title: 'Test Finding 2',
        severity: 'medium',
        status: 'not_a_finding',
      };

      const result = service.parseStigFinding(finding);

      expect(result.controlId).toBeUndefined();
      expect(result.severity).toBe('CAT_II');
      expect(result.status).toBe('Not_a_Finding');
    });

    it('should normalize severity levels', () => {
      const testCases = [
        { input: 'high', expected: 'CAT_I' },
        { input: 'medium', expected: 'CAT_II' },
        { input: 'low', expected: 'CAT_III' },
        { input: 'CAT I', expected: 'CAT_I' },
        { input: 'CAT II', expected: 'CAT_II' },
        { input: 'CAT III', expected: 'CAT_III' },
      ];

      for (const testCase of testCases) {
        const finding = {
          rule_id: 'SV-123',
          vuln_id: 'V-123',
          severity: testCase.input,
          status: 'open',
        };

        const result = service.parseStigFinding(finding);
        expect(result.severity).toBe(testCase.expected);
      }
    });

    it('should normalize status values', () => {
      const testCases = [
        { input: 'open', expected: 'Open' },
        { input: 'not_a_finding', expected: 'Not_a_Finding' },
        { input: 'notafinding', expected: 'Not_a_Finding' },
        { input: 'not_applicable', expected: 'Not_Applicable' },
        { input: 'not_reviewed', expected: 'Not_Reviewed' },
      ];

      for (const testCase of testCases) {
        const finding = {
          rule_id: 'SV-123',
          vuln_id: 'V-123',
          severity: 'medium',
          status: testCase.input,
        };

        const result = service.parseStigFinding(finding);
        expect(result.status).toBe(testCase.expected);
      }
    });
  });
});
