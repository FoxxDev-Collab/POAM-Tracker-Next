import { Test, TestingModule } from '@nestjs/testing';
import { NotificationProcessor } from './notification.processor';
import { PrismaService } from '../../prisma/prisma.service';
import { Job } from 'bullmq';

describe('NotificationProcessor', () => {
  let processor: NotificationProcessor;
  let prisma: PrismaService;

  const mockPrismaService = {
    notification: {
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationProcessor,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    processor = module.get<NotificationProcessor>(NotificationProcessor);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(processor).toBeDefined();
  });

  describe('process', () => {
    it('should process send-notification job', async () => {
      const notification = {
        id: 1,
        userId: 1,
        type: 'alert',
        message: 'New vulnerability detected',
        priority: 'high',
        read: false,
        createdAt: new Date(),
      };

      mockPrismaService.notification.create.mockResolvedValue(notification);

      const job = {
        id: '123',
        name: 'send-notification',
        data: {
          userId: '1',
          type: 'alert',
          message: 'New vulnerability detected',
          priority: 'high',
        },
      } as Job;

      const result = await processor.process(job);

      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('notificationId', 1);
      expect(result).toHaveProperty('sentAt');
      expect(prisma.notification.create).toHaveBeenCalledWith({
        data: {
          userId: 1,
          type: 'alert',
          message: 'New vulnerability detected',
          priority: 'high',
          metadata: {},
          read: false,
        },
      });
    });

    it('should process broadcast-notification job', async () => {
      const notification = {
        id: 1,
        userId: 1,
        type: 'system',
        message: 'System maintenance',
        priority: 'medium',
        read: false,
        createdAt: new Date(),
      };

      mockPrismaService.notification.create.mockResolvedValue(notification);

      const job = {
        id: '124',
        name: 'broadcast-notification',
        data: {
          userIds: ['1', '2', '3'],
          type: 'system',
          message: 'System maintenance scheduled',
          priority: 'medium',
        },
      } as Job;

      const result = await processor.process(job);

      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('sent', 3);
      expect(result).toHaveProperty('failed', 0);
      expect(result).toHaveProperty('total', 3);
    });

    it('should throw error for unknown job type', async () => {
      const job = {
        id: '125',
        name: 'unknown-job',
        data: {},
      } as Job;

      await expect(processor.process(job)).rejects.toThrow('Unknown job type: unknown-job');
    });
  });

  describe('sendNotification', () => {
    it('should create notification with high priority', async () => {
      const notification = {
        id: 1,
        userId: 1,
        type: 'security',
        message: 'Critical security alert',
        priority: 'high',
        metadata: { severity: 'critical' },
        read: false,
        createdAt: new Date(),
      };

      mockPrismaService.notification.create.mockResolvedValue(notification);

      const job = {
        id: '126',
        name: 'send-notification',
        data: {
          userId: '1',
          type: 'security',
          message: 'Critical security alert',
          priority: 'high',
          metadata: { severity: 'critical' },
        },
      } as Job;

      const result = await processor.process(job);

      expect(result.success).toBe(true);
      expect(result.notificationId).toBe(1);
    });

    it('should handle notification creation error', async () => {
      mockPrismaService.notification.create.mockRejectedValue(
        new Error('Database error'),
      );

      const job = {
        id: '127',
        name: 'send-notification',
        data: {
          userId: '1',
          type: 'info',
          message: 'Test',
          priority: 'low',
        },
      } as Job;

      await expect(processor.process(job)).rejects.toThrow('Database error');
    });
  });

  describe('broadcastNotification', () => {
    it('should broadcast to multiple users', async () => {
      const notification = {
        id: 1,
        userId: 1,
        type: 'announcement',
        message: 'System update',
        priority: 'medium',
        read: false,
        createdAt: new Date(),
      };

      mockPrismaService.notification.create.mockResolvedValue(notification);

      const job = {
        id: '128',
        name: 'broadcast-notification',
        data: {
          userIds: ['1', '2', '3', '4', '5'],
          type: 'announcement',
          message: 'System update scheduled',
          priority: 'medium',
        },
      } as Job;

      const result = await processor.process(job);

      expect(result.success).toBe(true);
      expect(result.sent).toBe(5);
      expect(result.total).toBe(5);
    });

    it('should handle partial failures in broadcast', async () => {
      mockPrismaService.notification.create
        .mockResolvedValueOnce({ id: 1, createdAt: new Date() })
        .mockRejectedValueOnce(new Error('Failed'))
        .mockResolvedValueOnce({ id: 2, createdAt: new Date() });

      const job = {
        id: '129',
        name: 'broadcast-notification',
        data: {
          userIds: ['1', '2', '3'],
          type: 'info',
          message: 'Test broadcast',
          priority: 'low',
        },
      } as Job;

      const result = await processor.process(job);

      expect(result.success).toBe(true);
      expect(result.sent).toBe(2);
      expect(result.failed).toBe(1);
      expect(result.total).toBe(3);
    });
  });
});
