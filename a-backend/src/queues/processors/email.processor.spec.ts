import { Test, TestingModule } from '@nestjs/testing';
import { EmailProcessor } from './email.processor';
import { Job } from 'bullmq';

describe('EmailProcessor', () => {
  let processor: EmailProcessor;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EmailProcessor],
    }).compile();

    processor = module.get<EmailProcessor>(EmailProcessor);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(processor).toBeDefined();
  });

  describe('process', () => {
    it('should process send-email job', async () => {
      const job = {
        id: '123',
        name: 'send-email',
        data: {
          to: 'test@example.com',
          subject: 'Test Subject',
          template: 'notification',
          context: { name: 'John' },
        },
      } as Job;

      const result = await processor.process(job);

      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('sentAt');
    });

    it('should process send-bulk-email job', async () => {
      const job = {
        id: '124',
        name: 'send-bulk-email',
        data: {
          recipients: ['test1@example.com', 'test2@example.com'],
          subject: 'Bulk Email',
          template: 'announcement',
          context: { message: 'Hello' },
        },
      } as Job;

      const result = await processor.process(job);

      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('sent', 2);
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

  describe('sendEmail', () => {
    it('should send email successfully', async () => {
      const job = {
        id: '126',
        name: 'send-email',
        data: {
          to: 'user@example.com',
          subject: 'Test',
          template: 'welcome',
          context: { name: 'Test User' },
        },
      } as Job;

      const result = await processor.process(job);

      expect(result.success).toBe(true);
      expect(result.sentAt).toBeInstanceOf(Date);
    });
  });

  describe('sendBulkEmail', () => {
    it('should send bulk email to multiple recipients', async () => {
      const job = {
        id: '127',
        name: 'send-bulk-email',
        data: {
          recipients: ['user1@example.com', 'user2@example.com', 'user3@example.com'],
          subject: 'System Update',
          template: 'system-notification',
          context: { updateType: 'Security Patch' },
        },
      } as Job;

      const result = await processor.process(job);

      expect(result.success).toBe(true);
      expect(result.sent).toBe(3);
    });

    it('should handle empty recipient list', async () => {
      const job = {
        id: '128',
        name: 'send-bulk-email',
        data: {
          recipients: [],
          subject: 'Test',
          template: 'test',
          context: {},
        },
      } as Job;

      const result = await processor.process(job);

      expect(result.success).toBe(true);
      expect(result.sent).toBe(0);
    });
  });
});
