import { Test, TestingModule } from '@nestjs/testing';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

describe('DashboardController', () => {
  let controller: DashboardController;
  let service: DashboardService;

  const mockDashboardService = {
    getStats: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DashboardController],
      providers: [
        {
          provide: DashboardService,
          useValue: mockDashboardService,
        },
      ],
    }).compile();

    controller = module.get<DashboardController>(DashboardController);
    service = module.get<DashboardService>(DashboardService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getStats', () => {
    it('should return dashboard statistics', async () => {
      const mockStats = {
        stats: {
          catI: 5,
          catII: 10,
          resolvedToday: 2,
          pendingReviews: 15,
          totalSystems: 3,
          totalPackages: 2,
        },
        recentActivity: [
          {
            rule_title: 'Test Rule',
            severity: 'CAT_I',
            status: 'Open',
            last_seen: new Date().toISOString(),
            system_name: 'Test System',
            rule_id: 'V-12345',
          },
        ],
      };

      mockDashboardService.getStats.mockResolvedValue(mockStats);

      const result = await controller.getStats();

      expect(result).toEqual(mockStats);
      expect(service.getStats).toHaveBeenCalled();
    });

    it('should handle empty statistics', async () => {
      const emptyStats = {
        stats: {
          catI: 0,
          catII: 0,
          resolvedToday: 0,
          pendingReviews: 0,
          totalSystems: 0,
          totalPackages: 0,
        },
        recentActivity: [],
      };

      mockDashboardService.getStats.mockResolvedValue(emptyStats);

      const result = await controller.getStats();

      expect(result).toEqual(emptyStats);
    });

    it('should propagate service errors', async () => {
      mockDashboardService.getStats.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(controller.getStats()).rejects.toThrow('Database error');
    });
  });

  describe('guards', () => {
    it('should be protected by JwtAuthGuard', () => {
      const guards = Reflect.getMetadata('__guards__', DashboardController);
      expect(guards).toBeDefined();
    });
  });
});
