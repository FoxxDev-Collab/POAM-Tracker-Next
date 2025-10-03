import { Test, TestingModule } from '@nestjs/testing';
import { VulnerabilitiesService } from './vulnerabilities.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrismaService = {
  stigFinding: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    createMany: jest.fn(),
  },
  stigScan: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
  },
  system: {
    findMany: jest.fn(),
  },
  nessusReport: {
    findMany: jest.fn(),
    create: jest.fn(),
  },
  nessusHost: {
    findMany: jest.fn(),
    create: jest.fn(),
  },
  nessusVulnerability: {
    findMany: jest.fn(),
    groupBy: jest.fn(),
    count: jest.fn(),
    createMany: jest.fn(),
  },
};

describe('VulnerabilitiesService', () => {
  let service: VulnerabilitiesService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VulnerabilitiesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<VulnerabilitiesService>(VulnerabilitiesService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findBySystem', () => {
    it('should find STIG findings by system ID', async () => {
      const findings = [
        { id: 1, systemId: 123, severity: 'High', stpVulnerabilities: [] },
        { id: 2, systemId: 123, severity: 'Medium', stpVulnerabilities: [] },
      ];
      mockPrismaService.stigFinding.findMany.mockResolvedValue(findings);

      const result = await service.findBySystem(123);

      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('activeStps');
      expect(result[0].stpVulnerabilities).toBeUndefined();
      expect(prisma.stigFinding.findMany).toHaveBeenCalledWith({
        where: { systemId: 123 },
        include: expect.objectContaining({
          system: expect.any(Object),
          scan: expect.any(Object),
        }),
        orderBy: [{ severity: 'desc' }, { lastSeen: 'desc' }],
      });
    });

    it('should return empty array when no findings exist', async () => {
      mockPrismaService.stigFinding.findMany.mockResolvedValue([]);

      const result = await service.findBySystem(999);

      expect(result).toEqual([]);
    });
  });

  describe('findByGroup', () => {
    it('should find STIG findings by group ID', async () => {
      const findings = [{ id: 1, groupId: 456, stpVulnerabilities: [] }];
      mockPrismaService.stigFinding.findMany.mockResolvedValue(findings);

      const result = await service.findByGroup(456);

      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('activeStps');
      expect(prisma.stigFinding.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            system: {
              groupId: 456,
            },
          }),
        }),
      );
    });
  });

  describe('findNessusReports', () => {
    it('should find Nessus reports by package ID', async () => {
      const reports = [{ id: 1, packageId: 100 }];
      mockPrismaService.nessusReport.findMany.mockResolvedValue(reports);

      const result = await service.findNessusReports({ packageId: 100 });

      expect(result).toEqual(reports);
      expect(prisma.nessusReport.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            packageId: 100,
          }),
        }),
      );
    });

    it('should find Nessus reports by system ID', async () => {
      const reports = [{ id: 1, systemId: 200 }];
      mockPrismaService.nessusReport.findMany.mockResolvedValue(reports);

      const result = await service.findNessusReports({ systemId: 200 });

      expect(result).toEqual(reports);
    });

    it('should find all Nessus reports when no filters provided', async () => {
      const reports = [{ id: 1 }, { id: 2 }];
      mockPrismaService.nessusReport.findMany.mockResolvedValue(reports);

      const result = await service.findNessusReports({});

      expect(result).toEqual(reports);
    });
  });

  describe('findAll', () => {
    it('should find all STIG findings', async () => {
      const findings = [
        { id: 1, stpVulnerabilities: [] },
        { id: 2, stpVulnerabilities: [] },
      ];
      mockPrismaService.stigFinding.findMany.mockResolvedValue(findings);

      const result = await service.findAll({});

      expect(result).toHaveLength(2);
    });

    it('should filter by severity', async () => {
      const findings = [{ id: 1, severity: 'Critical', stpVulnerabilities: [] }];
      mockPrismaService.stigFinding.findMany.mockResolvedValue(findings);

      await service.findAll({ severity: 'Critical' });

      expect(prisma.stigFinding.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            severity: 'Critical',
          }),
        }),
      );
    });

    it('should filter by status', async () => {
      mockPrismaService.stigFinding.findMany.mockResolvedValue([]);

      await service.findAll({ status: 'Open' });

      expect(prisma.stigFinding.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'Open',
          }),
        }),
      );
    });

    it('should filter by systemId', async () => {
      mockPrismaService.stigFinding.findMany.mockResolvedValue([]);

      await service.findAll({ systemId: 123 });

      expect(prisma.stigFinding.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            systemId: 123,
          }),
        }),
      );
    });

    it('should filter by groupId', async () => {
      mockPrismaService.stigFinding.findMany.mockResolvedValue([]);

      await service.findAll({ groupId: 456 });

      expect(prisma.stigFinding.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            system: {
              groupId: 456,
            },
          }),
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should find a single STIG finding by ID', async () => {
      const finding = {
        id: 1,
        systemId: 123,
        severity: 'High',
        stpVulnerabilities: [
          { stp: { id: 1, title: 'Test STP', status: 'Active' } },
        ],
      };
      mockPrismaService.stigFinding.findUnique.mockResolvedValue(finding);

      const result = await service.findOne(1);

      expect(result).toBeDefined();
      expect(result).not.toBeNull();
      expect(result!.activeStps).toHaveLength(1);
      expect(result!.stpVulnerabilities).toBeUndefined();
      expect(prisma.stigFinding.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: expect.any(Object),
      });
    });

    it('should return null when finding does not exist', async () => {
      mockPrismaService.stigFinding.findUnique.mockResolvedValue(null);

      const result = await service.findOne(999);

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update a STIG finding', async () => {
      const updated = {
        id: 1,
        status: 'NotAFinding',
        lastSeen: new Date(),
      };
      mockPrismaService.stigFinding.update.mockResolvedValue(updated);

      const result = await service.update(1, { status: 'NotAFinding' });

      expect(result).toEqual(updated);
      expect(prisma.stigFinding.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: expect.objectContaining({
          status: 'NotAFinding',
          lastSeen: expect.any(Date),
        }),
        include: expect.any(Object),
      });
    });
  });

  describe('findScans', () => {
    it('should find all STIG scans', async () => {
      const scans = [
        { id: 1, systemId: 123, title: 'Scan 1', stigFindings: [] },
      ];
      mockPrismaService.stigScan.findMany.mockResolvedValue(scans);

      const result = await service.findScans();

      expect(result).toEqual(scans);
      expect(prisma.stigScan.findMany).toHaveBeenCalledWith({
        where: {},
        include: expect.any(Object),
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should find STIG scans by system ID', async () => {
      const scans = [{ id: 1, systemId: 123 }];
      mockPrismaService.stigScan.findMany.mockResolvedValue(scans);

      await service.findScans(123);

      expect(prisma.stigScan.findMany).toHaveBeenCalledWith({
        where: { systemId: 123 },
        include: expect.any(Object),
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('createScan', () => {
    it('should create a new STIG scan', async () => {
      const scan = {
        id: 1,
        systemId: 123,
        title: 'New Scan',
        checklistId: 'CKL-123',
      };
      mockPrismaService.stigScan.create.mockResolvedValue(scan);

      const result = await service.createScan(123, {
        title: 'New Scan',
        checklistId: 'CKL-123',
      });

      expect(result).toEqual(scan);
      expect(prisma.stigScan.create).toHaveBeenCalledWith({
        data: {
          systemId: 123,
          title: 'New Scan',
          checklistId: 'CKL-123',
        },
        include: expect.any(Object),
      });
    });
  });

  describe('getScanWithFindings', () => {
    it('should get a scan with its findings', async () => {
      const scan = {
        id: 1,
        systemId: 123,
        stigFindings: [{ id: 1 }, { id: 2 }],
      };
      mockPrismaService.stigScan.findUnique.mockResolvedValue(scan);

      const result = await service.getScanWithFindings(1);

      expect(result).toEqual(scan);
      expect(prisma.stigScan.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: expect.any(Object),
      });
    });
  });

  describe('createFindings', () => {
    it('should create multiple findings from scan data', async () => {
      const findingsData = [
        {
          ruleId: 'SV-1',
          severity: 'CAT_I',
          status: 'Open',
          ruleTitle: 'Test Rule',
        },
        {
          ruleId: 'SV-2',
          severity: 'CAT_II',
          status: 'Open',
          ruleTitle: 'Test Rule 2',
        },
      ];

      const scanWithFindings = {
        id: 1,
        systemId: 123,
        stigFindings: [],
      };

      mockPrismaService.stigFinding.createMany.mockResolvedValue({ count: 2 });
      mockPrismaService.stigScan.findUnique.mockResolvedValue(scanWithFindings);

      const result = await service.createFindings(1, 123, findingsData);

      expect(result).toEqual(scanWithFindings);
      expect(prisma.stigFinding.createMany).toHaveBeenCalledWith({
        data: expect.arrayContaining([
          expect.objectContaining({
            scanId: 1,
            systemId: 123,
            ruleId: 'SV-1',
          }),
        ]),
      });
    });

    it('should filter out findings without ruleId', async () => {
      const findingsData = [
        { ruleId: 'SV-1', severity: 'CAT_I', status: 'Open' },
        { severity: 'CAT_II', status: 'Open' }, // Missing ruleId
      ];

      mockPrismaService.stigFinding.createMany.mockResolvedValue({ count: 1 });
      mockPrismaService.stigScan.findUnique.mockResolvedValue({ id: 1 });

      await service.createFindings(1, 123, findingsData);

      expect(prisma.stigFinding.createMany).toHaveBeenCalledWith({
        data: expect.arrayContaining([
          expect.objectContaining({ ruleId: 'SV-1' }),
        ]),
      });
      expect(prisma.stigFinding.createMany).toHaveBeenCalledWith({
        data: expect.not.arrayContaining([
          expect.objectContaining({ ruleId: undefined }),
        ]),
      });
    });
  });

  describe('getGroupVulnerabilityMetrics', () => {
    it('should calculate vulnerability metrics for a group', async () => {
      const systems = [
        { id: 1, name: 'System 1', _count: { stigFindings: 10, stigScans: 2 } },
        { id: 2, name: 'System 2', _count: { stigFindings: 5, stigScans: 1 } },
      ];

      const findings = [
        { severity: 'CAT_I', status: 'Open', lastSeen: new Date() },
        { severity: 'CAT_I', status: 'NotAFinding', lastSeen: new Date() },
        { severity: 'CAT_II', status: 'Open', lastSeen: new Date() },
        { severity: 'CAT_III', status: 'Not_Applicable', lastSeen: new Date() },
      ];

      const latestScan = { createdAt: new Date() };

      mockPrismaService.system.findMany.mockResolvedValue(systems);
      mockPrismaService.stigFinding.findMany.mockResolvedValue(findings);
      mockPrismaService.stigScan.findFirst.mockResolvedValue(latestScan);

      const result = await service.getGroupVulnerabilityMetrics(1);

      expect(result).toEqual({
        totalFindings: 4,
        openFindings: 2,
        closedFindings: 1,
        catISeverity: 2,
        catIISeverity: 1,
        catIIISeverity: 1,
        complianceRate: 50,
        systemsWithFindings: 2,
        totalSystems: 2,
        lastScanDate: latestScan.createdAt,
        systems: [
          { id: 1, name: 'System 1', findingsCount: 10, scansCount: 2 },
          { id: 2, name: 'System 2', findingsCount: 5, scansCount: 1 },
        ],
      });
    });

    it('should handle groups with no findings', async () => {
      mockPrismaService.system.findMany.mockResolvedValue([]);
      mockPrismaService.stigFinding.findMany.mockResolvedValue([]);
      mockPrismaService.stigScan.findFirst.mockResolvedValue(null);

      const result = await service.getGroupVulnerabilityMetrics(999);

      expect(result.totalFindings).toBe(0);
      expect(result.complianceRate).toBe(0);
      expect(result.lastScanDate).toBeNull();
    });
  });

  describe('importNessusData', () => {
    it('should import Nessus report data', async () => {
      const nessusData: any = {
        report: {
          name: 'Test Report',
          filename: 'test-report.nessus',
          scan_name: 'Test Scan',
          scan_date: new Date().toISOString(),
          scan_start: new Date().toISOString(),
          scan_end: new Date().toISOString(),
          total_hosts: 1,
          total_vulnerabilities: 1,
        },
        hosts: [
          {
            ip_address: '192.168.1.1',
            hostname: 'test-host',
            os: 'Linux',
          },
        ],
        vulnerabilities: [
          {
            plugin_id: '12345',
            plugin_name: 'Test Vulnerability',
            severity: 'Critical',
            host_ip: '192.168.1.1',
          },
        ],
        package_id: 1,
      };

      const createdReport = { id: 1, ...nessusData.report };
      const createdHost = { id: 1, ip_address: '192.168.1.1' };

      mockPrismaService.nessusReport.create.mockResolvedValue(createdReport);
      mockPrismaService.nessusHost.create.mockResolvedValue(createdHost);
      mockPrismaService.nessusVulnerability.createMany.mockResolvedValue({ count: 1 });

      const result = await service.importNessusData(nessusData);

      expect(result).toEqual({
        report: createdReport,
        hostsCreated: 1,
        vulnerabilitiesCreated: 1,
      });
      expect(prisma.nessusReport.create).toHaveBeenCalled();
      expect(prisma.nessusHost.create).toHaveBeenCalled();
      expect(prisma.nessusVulnerability.createMany).toHaveBeenCalled();
    });
  });
});
