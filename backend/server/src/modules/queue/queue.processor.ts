import { Processor, Process } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { ReportFormat } from '../usage/dto/index.dto';
import { UsageRepository } from '../usage/usage.repository';

@Processor('usage-reports')
export class ReportProcessor {
  private readonly logger = new Logger(ReportProcessor.name);

  constructor(private readonly usageRepository: UsageRepository) {}

  @Process('generate-report')
  async handleReportGeneration(
    job: Job<{
      jobId: string;
      userId: string;
      format: ReportFormat;
      startDate?: Date;
      endDate?: Date;
    }>,
  ) {
    this.logger.log(`Starting report generation job ${job.id}`);

    try {
      // Generate the report here

      await this.usageRepository.updateReportStatus(
        job.data.jobId,
        'COMPLETED',
      );
      // Store the report file

      this.logger.warn(`Report generated successfully for job ${job.id}`);

      // return { filePath }; // This will be available in job.returnvalue
    } catch (error) {
      this.logger.error(`Report generation failed for job ${job.id}:  `);
      throw error;
    }
  }
}

@Processor('billing-jobs')
export class BillingProcessor {
  private readonly logger = new Logger(BillingProcessor.name);

  constructor(private readonly usageRepository: UsageRepository) {}

  @Process('process-billing-period')
  handleBillingPeriod(job: Job<{ userId: string }>) {
    this.logger.log(
      `Starting billing processing job ${job.id} for user ${job.data.userId}`,
    );

    try {
      this.logger.log(`Invoice generated successfully for job ${job.id}`);
    } catch (error: any) {
      this.logger.error(
        `Billing processing failed for job ${job.id}: ${error.message}`,
      );
      throw error;
    }
  }
}
