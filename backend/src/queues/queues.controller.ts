import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { QueuesService } from './queues.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api/queues')
@UseGuards(JwtAuthGuard)
export class QueuesController {
  constructor(private readonly queuesService: QueuesService) {}

  @Post('email')
  async sendEmail(
    @Body()
    data: {
      to: string;
      subject: string;
      template: string;
      context: any;
    },
  ) {
    await this.queuesService.addEmailJob(data);
    return { message: 'Email job added to queue' };
  }

  @Post('report')
  async generateReport(
    @Body()
    data: {
      type: 'poam' | 'vulnerability' | 'compliance' | 'system';
      format: 'pdf' | 'excel' | 'csv';
      filters: any;
      userId: string;
    },
  ) {
    await this.queuesService.addReportJob(data);
    return { message: 'Report generation job added to queue' };
  }

  @Post('notification')
  async sendNotification(
    @Body()
    data: {
      userId: string;
      type: string;
      message: string;
      priority: 'low' | 'medium' | 'high';
    },
  ) {
    await this.queuesService.addNotificationJob(data);
    return { message: 'Notification job added to queue' };
  }

  @Post('vulnerability-scan')
  async startVulnerabilityScan(
    @Body()
    data: {
      systemId: string;
      scanType: 'quick' | 'full' | 'compliance';
      userId: string;
    },
  ) {
    await this.queuesService.addVulnerabilityScanJob(data);
    return { message: 'Vulnerability scan job added to queue' };
  }

  @Get('stats')
  async getAllQueuesStats() {
    return await this.queuesService.getAllQueuesStats();
  }

  @Get('stats/:queueName')
  async getQueueStats(@Param('queueName') queueName: string) {
    return await this.queuesService.getQueueStats(queueName);
  }

  @Post('clean/:queueName')
  async cleanQueue(@Param('queueName') queueName: string) {
    await this.queuesService.cleanQueue(queueName);
    return { message: `Queue ${queueName} cleaned successfully` };
  }
}