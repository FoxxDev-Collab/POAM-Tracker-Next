import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { QueuesService } from './queues.service';
import { QueuesController } from './queues.controller';
import { EmailProcessor } from './processors/email.processor';
import { ReportProcessor } from './processors/report.processor';
import { NotificationProcessor } from './processors/notification.processor';
import { VulnerabilityScanProcessor } from './processors/vulnerability-scan.processor';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD || 'redis123',
      },
    }),
    BullModule.registerQueue(
      { name: 'email' },
      { name: 'report' },
      { name: 'notification' },
      { name: 'vulnerability-scan' }
    ),
  ],
  controllers: [QueuesController],
  providers: [
    QueuesService,
    EmailProcessor,
    ReportProcessor,
    NotificationProcessor,
    VulnerabilityScanProcessor,
  ],
  exports: [QueuesService, BullModule],
})
export class QueuesModule {}