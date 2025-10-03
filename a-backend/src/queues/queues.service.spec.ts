import { Test, TestingModule } from '@nestjs/testing';
import { QueuesService } from './queues.service';
import { getQueueToken } from '@nestjs/bullmq';

describe('QueuesService', () => {
  let service: QueuesService;

  const mockQueue = {
    add: jest.fn(),
    getWaitingCount: jest.fn(),
    getActiveCount: jest.fn(),
    getCompletedCount: jest.fn(),
    getFailedCount: jest.fn(),
    getDelayedCount: jest.fn(),
    clean: jest.fn(),
  };

  const mockEmailQueue = { ...mockQueue };
  const mockReportQueue = { ...mockQueue };
  const mockNotificationQueue = { ...mockQueue };
  const mockVulnerabilityScanQueue = { ...mockQueue };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QueuesService,
        {
          provide: getQueueToken('email'),
          useValue: mockEmailQueue,
        },
        {
          provide: getQueueToken('report'),
          useValue: mockReportQueue,
        },
        {
          provide: getQueueToken('notification'),
          useValue: mockNotificationQueue,
        },
        {
          provide: getQueueToken('vulnerability-scan'),
          useValue: mockVulnerabilityScanQueue,
        },
      ],
    }).compile();

    service = module.get<QueuesService>(QueuesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('addEmailJob', () => {
    it('should add email job to queue', async () => {
      const emailData = {
        to: 'user@example.com',
        subject: 'Test Email',
        template: 'notification',
        context: { name: 'John' },
      };

      mockEmailQueue.add.mockResolvedValue({});

      await service.addEmailJob(emailData);

      expect(mockEmailQueue.add).toHaveBeenCalledWith(
        'send-email',
        emailData,
        expect.objectContaining({
          attempts: 3,
          backoff: expect.any(Object),
        }),
      );
    });

    it('should configure retry attempts', async () => {
      const emailData = {
        to: 'test@test.com',
        subject: 'Test',
        template: 'test',
        context: {},
      };

      mockEmailQueue.add.mockResolvedValue({});

      await service.addEmailJob(emailData);

      expect(mockEmailQueue.add).toHaveBeenCalledWith(
        'send-email',
        emailData,
        expect.objectContaining({
          attempts: 3,
          backoff: expect.objectContaining({
            type: 'exponential',
            delay: 2000,
          }),
        }),
      );
    });
  });

  describe('addReportJob', () => {
    it('should add report generation job to queue', async () => {
      const reportData = {
        type: 'poam' as const,
        format: 'pdf' as const,
        filters: { status: 'Open' },
        userId: 'user-123',
      };

      mockReportQueue.add.mockResolvedValue({});

      await service.addReportJob(reportData);

      expect(mockReportQueue.add).toHaveBeenCalledWith(
        'generate-report',
        reportData,
        expect.objectContaining({
          attempts: 2,
          backoff: expect.any(Object),
        }),
      );
    });

    it('should support different report types', async () => {
      const reportTypes = ['poam', 'vulnerability', 'compliance', 'system'] as const;

      for (const type of reportTypes) {
        const reportData = {
          type,
          format: 'pdf' as const,
          filters: {},
          userId: 'user-123',
        };

        mockReportQueue.add.mockResolvedValue({});
        await service.addReportJob(reportData);

        expect(mockReportQueue.add).toHaveBeenCalled();
        mockReportQueue.add.mockClear();
      }
    });
  });

  describe('addNotificationJob', () => {
    it('should add high priority notification with no delay', async () => {
      const notificationData = {
        userId: 'user-123',
        type: 'alert',
        message: 'Critical security finding',
        priority: 'high' as const,
      };

      mockNotificationQueue.add.mockResolvedValue({});

      await service.addNotificationJob(notificationData);

      expect(mockNotificationQueue.add).toHaveBeenCalledWith(
        'send-notification',
        notificationData,
        expect.objectContaining({
          delay: 0,
        }),
      );
    });

    it('should add medium priority notification with delay', async () => {
      const notificationData = {
        userId: 'user-123',
        type: 'info',
        message: 'New finding detected',
        priority: 'medium' as const,
      };

      mockNotificationQueue.add.mockResolvedValue({});

      await service.addNotificationJob(notificationData);

      expect(mockNotificationQueue.add).toHaveBeenCalledWith(
        'send-notification',
        notificationData,
        expect.objectContaining({
          delay: 5000,
        }),
      );
    });

    it('should add low priority notification with longer delay', async () => {
      const notificationData = {
        userId: 'user-123',
        type: 'update',
        message: 'System updated',
        priority: 'low' as const,
      };

      mockNotificationQueue.add.mockResolvedValue({});

      await service.addNotificationJob(notificationData);

      expect(mockNotificationQueue.add).toHaveBeenCalledWith(
        'send-notification',
        notificationData,
        expect.objectContaining({
          delay: 10000,
        }),
      );
    });

    it('should configure job cleanup options', async () => {
      const notificationData = {
        userId: 'user-123',
        type: 'info',
        message: 'Test',
        priority: 'high' as const,
      };

      mockNotificationQueue.add.mockResolvedValue({});

      await service.addNotificationJob(notificationData);

      expect(mockNotificationQueue.add).toHaveBeenCalledWith(
        'send-notification',
        notificationData,
        expect.objectContaining({
          removeOnComplete: true,
          removeOnFail: false,
        }),
      );
    });
  });

  describe('addVulnerabilityScanJob', () => {
    it('should add vulnerability scan job to queue', async () => {
      const scanData = {
        systemId: 'system-123',
        scanType: 'full' as const,
        userId: 'user-123',
      };

      mockVulnerabilityScanQueue.add.mockResolvedValue({});

      await service.addVulnerabilityScanJob(scanData);

      expect(mockVulnerabilityScanQueue.add).toHaveBeenCalledWith(
        'scan-system',
        scanData,
        expect.any(Object),
      );
    });

    it('should support different scan types', async () => {
      const scanTypes = ['quick', 'full', 'compliance'] as const;

      for (const scanType of scanTypes) {
        const scanData = {
          systemId: 'system-123',
          scanType,
          userId: 'user-123',
        };

        mockVulnerabilityScanQueue.add.mockResolvedValue({});
        await service.addVulnerabilityScanJob(scanData);

        expect(mockVulnerabilityScanQueue.add).toHaveBeenCalled();
        mockVulnerabilityScanQueue.add.mockClear();
      }
    });
  });

  describe('getAllQueuesStats', () => {
    it('should return statistics for all queues', async () => {
      mockEmailQueue.getWaitingCount.mockResolvedValue(5);
      mockEmailQueue.getActiveCount.mockResolvedValue(2);
      mockEmailQueue.getCompletedCount.mockResolvedValue(100);
      mockEmailQueue.getFailedCount.mockResolvedValue(3);
      mockEmailQueue.getDelayedCount.mockResolvedValue(1);

      mockReportQueue.getWaitingCount.mockResolvedValue(3);
      mockReportQueue.getActiveCount.mockResolvedValue(1);
      mockReportQueue.getCompletedCount.mockResolvedValue(50);
      mockReportQueue.getFailedCount.mockResolvedValue(2);
      mockReportQueue.getDelayedCount.mockResolvedValue(0);

      mockNotificationQueue.getWaitingCount.mockResolvedValue(10);
      mockNotificationQueue.getActiveCount.mockResolvedValue(5);
      mockNotificationQueue.getCompletedCount.mockResolvedValue(200);
      mockNotificationQueue.getFailedCount.mockResolvedValue(5);
      mockNotificationQueue.getDelayedCount.mockResolvedValue(2);

      mockVulnerabilityScanQueue.getWaitingCount.mockResolvedValue(2);
      mockVulnerabilityScanQueue.getActiveCount.mockResolvedValue(1);
      mockVulnerabilityScanQueue.getCompletedCount.mockResolvedValue(30);
      mockVulnerabilityScanQueue.getFailedCount.mockResolvedValue(0);
      mockVulnerabilityScanQueue.getDelayedCount.mockResolvedValue(0);

      const result = await service.getAllQueuesStats();

      expect(result).toBeInstanceOf(Array);
      expect(result).toHaveLength(4);
      expect(result[0]).toHaveProperty('name', 'email');
      expect(result[0]).toHaveProperty('stats');
      expect(result[1]).toHaveProperty('name', 'report');
      expect(result[2]).toHaveProperty('name', 'notification');
      expect(result[3]).toHaveProperty('name', 'vulnerability-scan');
    });
  });

  describe('getQueueStats', () => {
    it('should return statistics for a specific queue', async () => {
      mockEmailQueue.getWaitingCount.mockResolvedValue(5);
      mockEmailQueue.getActiveCount.mockResolvedValue(2);
      mockEmailQueue.getCompletedCount.mockResolvedValue(100);
      mockEmailQueue.getFailedCount.mockResolvedValue(3);
      mockEmailQueue.getDelayedCount.mockResolvedValue(1);

      const result = await service.getQueueStats('email');

      expect(result).toHaveProperty('waiting', 5);
      expect(result).toHaveProperty('active', 2);
      expect(result).toHaveProperty('completed', 100);
      expect(result).toHaveProperty('failed', 3);
      expect(result).toHaveProperty('delayed', 1);
    });
  });

  describe('cleanQueue', () => {
    it('should clean completed and failed jobs from queue', async () => {
      mockEmailQueue.clean.mockResolvedValue({});

      await service.cleanQueue('email');

      expect(mockEmailQueue.clean).toHaveBeenCalledTimes(2);
      expect(mockEmailQueue.clean).toHaveBeenCalledWith(
        5000,
        100,
        'completed',
      );
      expect(mockEmailQueue.clean).toHaveBeenCalledWith(
        5000,
        100,
        'failed',
      );
    });
  });
});
