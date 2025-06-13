import { InjectQueue } from '@nestjs/bull';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Queue } from 'bull';
import { ReportFormat } from '../usage/dto/index.dto';

@Injectable()
export class QueueService implements OnModuleInit {
  private readonly logger = new Logger(QueueService.name);

  constructor(
    @InjectQueue('usage-reports') private readonly reportQueue: Queue,
    @InjectQueue('billing-jobs') private readonly billingQueue: Queue,
  ) {}

  onModuleInit() {
    this.setupQueueEventHandlers(this.reportQueue, 'usage-reports');
    this.setupQueueEventHandlers(this.billingQueue, 'billing-jobs');
  }

  private setupQueueEventHandlers(queue: Queue, queueName: string) {
    queue.on('completed', (job) => {
      this.logger.log(`[${queueName}] Job ${job.id} completed`);
    });

    queue.on('failed', (job, err) => {
      this.logger.error(`[${queueName}] Job ${job.id} failed: ${err.message}`);
    });

    queue.on('stalled', (job) => {
      this.logger.warn(`[${queueName}] Job ${job.id} stalled`);
    });
  }

  async ping(): Promise<boolean> {
    try {
      // For Redis-based queues, Bull uses Redis client internally
      // We can check Redis connection by getting queue metrics
      const reportQueueCounts = await this.reportQueue.getJobCounts();
      const billingQueueCounts = await this.billingQueue.getJobCounts();

      // If we get counts without error, connection is healthy
      this.logger.debug('Queue service ping successful');
      return true;
    } catch (error: any) {
      this.logger.error('Queue service ping failed', error.message);
      return false;
    }
  }
  // ========== Report Generation ==========
  async addReportJob(payload: {
    jobId: string;
    userId: string;
    format: ReportFormat;
    startDate?: string;
    endDate?: string;
  }) {
    const job = await this.reportQueue.add('generate-report', payload, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000, // 5s, 10s, 20s
      },
      removeOnComplete: true,
      removeOnFail: true,
    });

    this.logger.log(`Report job ${job.id} queued for user ${payload.userId}`);
    return job.id;
  }

  // ========== Billing Processing ==========
  async addBillingPeriodJob(userId: string) {
    const job = await this.billingQueue.add(
      'process-billing-period',
      { userId },
      {
        attempts: 5,
        backoff: 30000, // 30s between retries
        removeOnComplete: true,
      },
    );

    this.logger.log(`Billing job ${job.id} queued for user ${userId}`);
    return job.id;
  }

  // ========== Queue Management ==========
  async cleanAllQueues() {
    await this.reportQueue.clean(0, 'completed');
    await this.reportQueue.clean(0, 'failed');
    await this.billingQueue.clean(0, 'completed');
    await this.billingQueue.clean(0, 'failed');
    this.logger.log('All queues cleaned');
  }

  async getQueueStats() {
    return {
      reportQueue: await this.reportQueue.getJobCounts(),
      billingQueue: await this.billingQueue.getJobCounts(),
    };
  }
}
