import { Test, TestingModule } from '@nestjs/testing';
import { DashboardService } from './dashboard.service';
import { PrismaService } from '../prisma/prisma.service';

describe('DashboardService', () => {
  let service: DashboardService;
  let prisma: PrismaService;

  const mockPrismaService = {
    stigFinding: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
    system: {
      count: jest.fn(),
    },
    package: {
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getStats', () => {
    beforeEach(() => {
      mockPrismaService.stigFinding.count.mockResolvedValue(0);
      mockPrismaService.system.count.mockResolvedValue(0);
      mockPrismaService.package.count.mockResolvedValue(0);
      mockPrismaService.stigFinding.findMany.mockResolvedValue([]);
    });

    it('should return dashboard statistics', async () => {
      mockPrismaService.stigFinding.count
        .mockResolvedValueOnce(5) // CAT I
        .mockResolvedValueOnce(10) // CAT II
        .mockResolvedValueOnce(2) // resolved today
        .mockResolvedValueOnce(15); // pending reviews
      mockPrismaService.system.count.mockResolvedValue(3);
      mockPrismaService.package.count.mockResolvedValue(2);

      const result = await service.getStats();

      expect(result).toHaveProperty('stats');
      expect(result.stats.catI).toBe(5);
      expect(result.stats.catII).toBe(10);
      expect(result.stats.resolvedToday).toBe(2);
      expect(result.stats.pendingReviews).toBe(15);
      expect(result.stats.totalSystems).toBe(3);
      expect(result.stats.totalPackages).toBe(2);
    });

    it('should include recent activity', async () => {
      const mockFindings = [
        {
          ruleTitle: 'Test Rule',
          severity: 'CAT_I',
          status: 'Open',
          lastSeen: new Date(),
          ruleId: 'V-12345',
          system: { name: 'Test System' },
        },
      ];
      mockPrismaService.stigFinding.findMany.mockResolvedValue(mockFindings);

      const result = await service.getStats();

      expect(result).toHaveProperty('recentActivity');
      expect(result.recentActivity).toHaveLength(1);
      expect(result.recentActivity[0]).toHaveProperty('rule_title');
      expect(result.recentActivity[0]).toHaveProperty('severity');
      expect(result.recentActivity[0]).toHaveProperty('status');
    });

    it('should count CAT I findings correctly', async () => {
      mockPrismaService.stigFinding.count.mockResolvedValueOnce(5);

      await service.getStats();

      expect(prisma.stigFinding.count).toHaveBeenCalledWith({
        where: { severity: 'CAT_I' },
      });
    });

    it('should count CAT II findings correctly', async () => {
      mockPrismaService.stigFinding.count
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(10);

      await service.getStats();

      expect(prisma.stigFinding.count).toHaveBeenCalledWith({
        where: { severity: 'CAT_II' },
      });
    });

    it('should count resolved findings for today', async () => {
      mockPrismaService.stigFinding.count
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(3);

      await service.getStats();

      expect(prisma.stigFinding.count).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'NotAFinding',
            lastSeen: expect.objectContaining({
              gte: expect.any(Date),
            }),
          }),
        }),
      );
    });

    it('should count pending reviews (open findings)', async () => {
      mockPrismaService.stigFinding.count
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(20);

      await service.getStats();

      expect(prisma.stigFinding.count).toHaveBeenCalledWith({
        where: { status: 'Open' },
      });
    });

    it('should fetch recent activity with correct limit', async () => {
      await service.getStats();

      expect(prisma.stigFinding.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 10,
          orderBy: { lastSeen: 'desc' },
        }),
      );
    });

    it('should transform recent activity data correctly', async () => {
      const mockDate = new Date('2024-01-01');
      const mockFindings = [
        {
          ruleTitle: 'Security Rule',
          severity: 'CAT_I',
          status: 'Open',
          lastSeen: mockDate,
          ruleId: 'V-99999',
          system: { name: 'Production System' },
        },
      ];
      mockPrismaService.stigFinding.findMany.mockResolvedValue(mockFindings);

      const result = await service.getStats();

      expect(result.recentActivity[0].rule_title).toBe('Security Rule');
      expect(result.recentActivity[0].severity).toBe('CAT_I');
      expect(result.recentActivity[0].status).toBe('Open');
      expect(result.recentActivity[0].last_seen).toBe(mockDate.toISOString());
      expect(result.recentActivity[0].system_name).toBe('Production System');
      expect(result.recentActivity[0].rule_id).toBe('V-99999');
    });

    it('should handle empty recent activity', async () => {
      mockPrismaService.stigFinding.findMany.mockResolvedValue([]);

      const result = await service.getStats();

      expect(result.recentActivity).toEqual([]);
    });

    it('should handle zero statistics', async () => {
      mockPrismaService.stigFinding.count.mockResolvedValue(0);
      mockPrismaService.system.count.mockResolvedValue(0);
      mockPrismaService.package.count.mockResolvedValue(0);

      const result = await service.getStats();

      expect(result.stats.catI).toBe(0);
      expect(result.stats.catII).toBe(0);
      expect(result.stats.resolvedToday).toBe(0);
      expect(result.stats.pendingReviews).toBe(0);
      expect(result.stats.totalSystems).toBe(0);
      expect(result.stats.totalPackages).toBe(0);
    });
  });
});
