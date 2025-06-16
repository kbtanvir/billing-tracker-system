import { Processor, Process } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { ReportFormat } from '../usage/dto/index.dto';
import { UsageRepository } from '../usage/usage.repository';
import { UsageService } from '../usage/usage.service';

@Processor('usage-reports')
export class ReportProcessor {
  private readonly logger = new Logger(ReportProcessor.name);

  constructor(private readonly usageService: UsageService) {}

  @Process('generate-report')
  async handleReportGeneration(
    job: Job<{
      reportId: string;
      userId: string;
      format: ReportFormat;
      startDate?: Date;
      endDate?: Date;
    }>,
  ) {
    this.logger.log(`Starting report generation job ${job.id}`);

    try {
      // Generate the report here
      await this.usageService.processReportJob(job.data.reportId);

      return job.id;
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
  async handleBillingPeriod(job: Job<{ userId: string }>) {
    try {
      this.logger.log(
        `Starting billing processing job ${job.id} for user ${job.data.userId}`,
      );
      return true;
    } catch (error: any) {
      this.logger.error(
        `Billing processing failed for job ${job.id}: ${error.message}`,
      );
      throw error;
    }
  }
}
