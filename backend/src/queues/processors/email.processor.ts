import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable, Logger } from '@nestjs/common';

@Processor('email')
@Injectable()
export class EmailProcessor extends WorkerHost {
  private readonly logger = new Logger(EmailProcessor.name);

  async process(job: Job<any>): Promise<any> {
    this.logger.log(`Processing email job ${job.id} of type ${job.name}`);

    switch (job.name) {
      case 'send-email':
        return this.sendEmail(job.data);
      case 'send-bulk-email':
        return this.sendBulkEmail(job.data);
      default:
        throw new Error(`Unknown job type: ${job.name}`);
    }
  }

  private async sendEmail(data: {
    to: string;
    subject: string;
    template: string;
    context: any;
  }) {
    this.logger.log(`Sending email to ${data.to} with subject: ${data.subject}`);

    // TODO: Integrate with actual email service (SendGrid, AWS SES, etc.)
    // For now, we'll simulate email sending
    await new Promise((resolve) => setTimeout(resolve, 1000));

    this.logger.log(`Email sent successfully to ${data.to}`);
    return { success: true, sentAt: new Date() };
  }

  private async sendBulkEmail(data: {
    recipients: string[];
    subject: string;
    template: string;
    context: any;
  }) {
    this.logger.log(`Sending bulk email to ${data.recipients.length} recipients`);

    const results = await Promise.all(
      data.recipients.map((recipient) =>
        this.sendEmail({
          to: recipient,
          subject: data.subject,
          template: data.template,
          context: data.context,
        })
      )
    );

    return { success: true, sent: results.length };
  }
}