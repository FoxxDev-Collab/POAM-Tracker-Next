import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Processor('notification')
@Injectable()
export class NotificationProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationProcessor.name);

  constructor(private prisma: PrismaService) {
    super();
  }

  async process(job: Job<any>): Promise<any> {
    this.logger.log(`Processing notification job ${job.id} of type ${job.name}`);

    switch (job.name) {
      case 'send-notification':
        return this.sendNotification(job.data);
      case 'broadcast-notification':
        return this.broadcastNotification(job.data);
      default:
        throw new Error(`Unknown job type: ${job.name}`);
    }
  }

  private async sendNotification(data: {
    userId: string;
    type: string;
    message: string;
    priority: 'low' | 'medium' | 'high';
    metadata?: any;
  }) {
    this.logger.log(`Sending ${data.priority} priority notification to user ${data.userId}`);

    try {
      // Store notification in database
      const notification = await this.prisma.notification.create({
        data: {
          userId: parseInt(data.userId),
          type: data.type,
          message: data.message,
          priority: data.priority,
          metadata: data.metadata || {},
          read: false,
        },
      });

      // TODO: Send real-time notification via WebSocket
      // TODO: Send push notification if enabled
      // TODO: Send email notification if high priority

      this.logger.log(`Notification sent successfully: ${notification.id}`);
      return {
        success: true,
        notificationId: notification.id,
        sentAt: notification.createdAt,
      };
    } catch (error) {
      this.logger.error(`Failed to send notification: ${error.message}`);
      throw error;
    }
  }

  private async broadcastNotification(data: {
    userIds: string[];
    type: string;
    message: string;
    priority: 'low' | 'medium' | 'high';
  }) {
    this.logger.log(`Broadcasting notification to ${data.userIds.length} users`);

    const results = await Promise.allSettled(
      data.userIds.map((userId) =>
        this.sendNotification({
          userId,
          type: data.type,
          message: data.message,
          priority: data.priority,
        })
      )
    );

    const successful = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.filter((r) => r.status === 'rejected').length;

    return {
      success: true,
      sent: successful,
      failed: failed,
      total: data.userIds.length,
    };
  }
}