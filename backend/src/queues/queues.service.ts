import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class QueuesService {
  constructor(
    @InjectQueue('email') private emailQueue: Queue,
    @InjectQueue('report') private reportQueue: Queue,
    @InjectQueue('notification') private notificationQueue: Queue,
    @InjectQueue('vulnerability-scan') private vulnerabilityScanQueue: Queue,
  ) {}

  async addEmailJob(data: {
    to: string;
    subject: string;
    template: string;
    context: any;
  }) {
    await this.emailQueue.add('send-email', data, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    });
  }

  async addReportJob(data: {
    type: 'poam' | 'vulnerability' | 'compliance' | 'system';
    format: 'pdf' | 'excel' | 'csv';
    filters: any;
    userId: string;
  }) {
    await this.reportQueue.add('generate-report', data, {
      attempts: 2,
      backoff: {
        type: 'exponential',
        delay: 5000,
      },
    });
  }

  async addNotificationJob(data: {
    userId: string;
    type: string;
    message: string;
    priority: 'low' | 'medium' | 'high';
  }) {
    const delay = data.priority === 'high' ? 0 : data.priority === 'medium' ? 5000 : 10000;

    await this.notificationQueue.add('send-notification', data, {
      delay,
      removeOnComplete: true,
      removeOnFail: false,
    });
  }

  async addVulnerabilityScanJob(data: {
    systemId: string;
    scanType: 'quick' | 'full' | 'compliance';
    userId: string;
  }) {
    await this.vulnerabilityScanQueue.add('scan-system', data, {
      attempts: 1,
      // Note: timeout is not a valid option in BullMQ, use job.updateProgress for long-running tasks
    });
  }

  async getQueueStats(queueName: string) {
    let queue: Queue;

    switch (queueName) {
      case 'email':
        queue = this.emailQueue;
        break;
      case 'report':
        queue = this.reportQueue;
        break;
      case 'notification':
        queue = this.notificationQueue;
        break;
      case 'vulnerability-scan':
        queue = this.vulnerabilityScanQueue;
        break;
      default:
        throw new Error(`Unknown queue: ${queueName}`);
    }

    const [waiting, active, completed, failed, delayed] = await Promise.all([
      queue.getWaitingCount(),
      queue.getActiveCount(),
      queue.getCompletedCount(),
      queue.getFailedCount(),
      queue.getDelayedCount(),
    ]);

    return {
      waiting,
      active,
      completed,
      failed,
      delayed,
      total: waiting + active + completed + failed + delayed,
    };
  }

  async getAllQueuesStats() {
    const queues = ['email', 'report', 'notification', 'vulnerability-scan'];
    const stats = await Promise.all(
      queues.map(async (queueName) => ({
        name: queueName,
        stats: await this.getQueueStats(queueName),
      }))
    );
    return stats;
  }

  async cleanQueue(queueName: string, grace: number = 5000) {
    let queue: Queue;

    switch (queueName) {
      case 'email':
        queue = this.emailQueue;
        break;
      case 'report':
        queue = this.reportQueue;
        break;
      case 'notification':
        queue = this.notificationQueue;
        break;
      case 'vulnerability-scan':
        queue = this.vulnerabilityScanQueue;
        break;
      default:
        throw new Error(`Unknown queue: ${queueName}`);
    }

    await queue.clean(grace, 100, 'completed');
    await queue.clean(grace, 100, 'failed');
  }
}