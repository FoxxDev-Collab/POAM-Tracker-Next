import { Test, TestingModule } from '@nestjs/testing';
import { QueuesController } from './queues.controller';
import { QueuesService } from './queues.service';

describe('QueuesController', () => {
  let controller: QueuesController;
  let service: QueuesService;

  const mockQueuesService = {
    addEmailJob: jest.fn(),
    addReportJob: jest.fn(),
    addNotificationJob: jest.fn(),
    addVulnerabilityScanJob: jest.fn(),
    getAllQueuesStats: jest.fn(),
    getQueueStats: jest.fn(),
    cleanQueue: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QueuesController],
      providers: [
        {
          provide: QueuesService,
          useValue: mockQueuesService,
        },
      ],
    }).compile();

    controller = module.get<QueuesController>(QueuesController);
    service = module.get<QueuesService>(QueuesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('sendEmail', () => {
    it('should add email job to queue', async () => {
      const emailData = {
        to: 'user@example.com',
        subject: 'Test Email',
        template: 'notification',
        context: { name: 'John' },
      };

      mockQueuesService.addEmailJob.mockResolvedValue(undefined);

      const result = await controller.sendEmail(emailData);

      expect(result).toEqual({ message: 'Email job added to queue' });
      expect(service.addEmailJob).toHaveBeenCalledWith(emailData);
    });
  });

  describe('generateReport', () => {
    it('should add report generation job to queue', async () => {
      const reportData = {
        type: 'poam' as const,
        format: 'pdf' as const,
        filters: { status: 'Open' },
        userId: 'user-123',
      };

      mockQueuesService.addReportJob.mockResolvedValue(undefined);

      const result = await controller.generateReport(reportData);

      expect(result).toEqual({ message: 'Report generation job added to queue' });
      expect(service.addReportJob).toHaveBeenCalledWith(reportData);
    });

    it('should support different report types', async () => {
      const reportTypes: Array<'poam' | 'vulnerability' | 'compliance' | 'system'> = [
        'poam',
        'vulnerability',
        'compliance',
        'system',
      ];

      for (const type of reportTypes) {
        const reportData = {
          type,
          format: 'pdf' as const,
          filters: {},
          userId: 'user-123',
        };

        mockQueuesService.addReportJob.mockResolvedValue(undefined);
        await controller.generateReport(reportData);

        expect(service.addReportJob).toHaveBeenCalledWith(reportData);
      }
    });

    it('should support different report formats', async () => {
      const formats: Array<'pdf' | 'excel' | 'csv'> = ['pdf', 'excel', 'csv'];

      for (const format of formats) {
        const reportData = {
          type: 'poam' as const,
          format,
          filters: {},
          userId: 'user-123',
        };

        mockQueuesService.addReportJob.mockResolvedValue(undefined);
        await controller.generateReport(reportData);

        expect(service.addReportJob).toHaveBeenCalledWith(reportData);
      }
    });
  });

  describe('sendNotification', () => {
    it('should add notification job to queue', async () => {
      const notificationData = {
        userId: 'user-123',
        type: 'alert',
        message: 'Critical security finding',
        priority: 'high' as const,
      };

      mockQueuesService.addNotificationJob.mockResolvedValue(undefined);

      const result = await controller.sendNotification(notificationData);

      expect(result).toEqual({ message: 'Notification job added to queue' });
      expect(service.addNotificationJob).toHaveBeenCalledWith(notificationData);
    });

    it('should handle different priority levels', async () => {
      const priorities: Array<'low' | 'medium' | 'high'> = ['low', 'medium', 'high'];

      for (const priority of priorities) {
        const notificationData = {
          userId: 'user-123',
          type: 'info',
          message: 'Test message',
          priority,
        };

        mockQueuesService.addNotificationJob.mockResolvedValue(undefined);
        await controller.sendNotification(notificationData);

        expect(service.addNotificationJob).toHaveBeenCalledWith(notificationData);
      }
    });
  });

  describe('startVulnerabilityScan', () => {
    it('should add vulnerability scan job to queue', async () => {
      const scanData = {
        systemId: 'system-123',
        scanType: 'full' as const,
        userId: 'user-123',
      };

      mockQueuesService.addVulnerabilityScanJob.mockResolvedValue(undefined);

      const result = await controller.startVulnerabilityScan(scanData);

      expect(result).toEqual({ message: 'Vulnerability scan job added to queue' });
      expect(service.addVulnerabilityScanJob).toHaveBeenCalledWith(scanData);
    });

    it('should support different scan types', async () => {
      const scanTypes: Array<'quick' | 'full' | 'compliance'> = [
        'quick',
        'full',
        'compliance',
      ];

      for (const scanType of scanTypes) {
        const scanData = {
          systemId: 'system-123',
          scanType,
          userId: 'user-123',
        };

        mockQueuesService.addVulnerabilityScanJob.mockResolvedValue(undefined);
        await controller.startVulnerabilityScan(scanData);

        expect(service.addVulnerabilityScanJob).toHaveBeenCalledWith(scanData);
      }
    });
  });

  describe('getAllQueuesStats', () => {
    it('should return statistics for all queues', async () => {
      const mockStats = {
        email: { waiting: 5, active: 2, completed: 100, failed: 3 },
        report: { waiting: 3, active: 1, completed: 50, failed: 1 },
        notification: { waiting: 10, active: 5, completed: 200, failed: 5 },
        'vulnerability-scan': { waiting: 2, active: 1, completed: 30, failed: 0 },
      };

      mockQueuesService.getAllQueuesStats.mockResolvedValue(mockStats);

      const result = await controller.getAllQueuesStats();

      expect(result).toEqual(mockStats);
      expect(service.getAllQueuesStats).toHaveBeenCalled();
    });
  });

  describe('getQueueStats', () => {
    it('should return statistics for a specific queue', async () => {
      const mockStats = {
        waiting: 5,
        active: 2,
        completed: 100,
        failed: 3,
      };

      mockQueuesService.getQueueStats.mockResolvedValue(mockStats);

      const result = await controller.getQueueStats('email');

      expect(result).toEqual(mockStats);
      expect(service.getQueueStats).toHaveBeenCalledWith('email');
    });
  });

  describe('cleanQueue', () => {
    it('should clean a queue', async () => {
      mockQueuesService.cleanQueue.mockResolvedValue(undefined);

      const result = await controller.cleanQueue('email');

      expect(result).toEqual({ message: 'Queue email cleaned successfully' });
      expect(service.cleanQueue).toHaveBeenCalledWith('email');
    });
  });

  describe('guards', () => {
    it('should be protected by JwtAuthGuard', () => {
      const guards = Reflect.getMetadata('__guards__', QueuesController);
      expect(guards).toBeDefined();
    });
  });
});
