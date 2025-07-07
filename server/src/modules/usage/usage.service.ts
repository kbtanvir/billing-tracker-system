import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '../config/config.service';
import { QueueService } from '../queue/queue.service';
import { S3Service } from '../s3/s3.service';
import {
  CreateUsageEventDto,
  ReportFormat,
  ReportRequestEntity,
  ReportStatusEntity,
  UpdateUsageEventDto,
  UsageQuery,
} from './dto/index.dto';
import { UsageRepository } from './usage.repository';
import { UserRepository } from './users.repository';

@Injectable()
export class UsageService {
  private readonly logger = new Logger(UsageService.name);

  constructor(
    private readonly repository: UsageRepository,
    private readonly queueService: QueueService,
    private readonly s3Service: S3Service,
    private readonly usersRepository: UserRepository,
    private readonly configService: ConfigService,
  ) {}

  async getAll() {
    return await this.usersRepository.getAll();
  }
  // ========== Usage Events ==========
  async createUsageEvent(dto: CreateUsageEventDto) {
    const userId = dto.userId;
    try {
      // Validate user exists
      const user = await this.usersRepository.findById(userId);
      if (!user) {
        throw new Error(`User ${userId} not found`);
      }

      // Create the usage event
      const event = await this.repository.createUsageEvent({
        ...dto,
        userId,
      });

      this.logger.log(`Created usage event for user ${userId}`);

      return event;
    } catch (error: any) {
      this.logger.error(`Failed to create usage event: ${error.message}`);
      throw error;
    }
  }

  async updateUsageEvent(id: string, dto: UpdateUsageEventDto) {
    try {
      const updatedEvent = await this.repository.updateUsageEvent(id, dto);
      this.logger.log(`Updated usage event ${id}`);
      return updatedEvent;
    } catch (error: any) {
      this.logger.error(`Failed to update usage event: ${error.message}`);
      throw error;
    }
  }

  async getUsageEvents(query: UsageQuery) {
    try {
      return await this.repository.findUsageEvents(query);
    } catch (error: any) {
      this.logger.error(`Failed to fetch usage events: ${error.message}`);
      throw error;
    }
  }

  // ========== Usage Summary & Billing ==========
  async getUserUsageSummary(userId: string) {
    try {
      const summary = await this.repository.getUserUsageSummary(userId);
      this.logger.log(`Fetched usage summary for user ${userId}`);
      return summary;
    } catch (error: any) {
      this.logger.error(`Failed to get usage summary: ${error.message}`);
      throw error;
    }
  }
  async resetUsageSummary(userId: string) {
    try {
      const summary = await this.repository.resetUsageSummary(userId);
      this.logger.log(`Fetched usage summary for user ${userId}`);
      return summary;
    } catch (error: any) {
      this.logger.error(`Failed to get usage summary: ${error.message}`);
      throw error;
    }
  }

  async generateMonthlyBilling(userId: string) {
    try {
      const period = await this.repository.createBillingPeriod(userId);
      await this.queueService.addBillingPeriodJob(userId);
      return period;
    } catch (error: any) {
      throw error;
    }
  }

  async updateReportStatus(dto: ReportStatusEntity) {
    return await this.repository.updateReportStatus(dto);
  }

  async addJobReport(dto: ReportRequestEntity) {
    return await this.repository.createReportJob(dto);
  }

  // ========== Reports ==========
  async generateReport(dto: ReportRequestEntity) {
    try {
      // Validate user exists
      await this.usersRepository.findById(dto.userId);

      // Create report job
      const report = await this.repository.createReportJob({
        userId: dto.userId,
        format: dto.format,
        startDate: dto.startDate,
        endDate: dto.endDate,
      });

      // Queue the report generation
      const job = await this.queueService.addReportJob({
        reportId: report.id,
        userId: dto.userId,
        format: dto.format,
        startDate: dto.startDate,
        endDate: dto.endDate,
      });

      return await this.repository.updateReportStatus({
        id: report.id,
        jobId: job.jobId.toString(),
        status: 'PENDING',
      });
    } catch (error: any) {
      this.logger.error(`Failed to start report generation: ${error.message}`);
      throw error;
    }
  }

  async getReportStatus(jobId: string) {
    try {
      return await this.repository.getReportStatus(jobId);
    } catch (error: any) {
      this.logger.error(`Failed to get report status: ${error.message}`);
      throw error;
    }
  }

  async processReportJob(reportId: string) {
    try {
      // Get report details
      const report = await this.repository.getReportStatus(reportId);

      // Update status to processing
      await this.repository.updateReportStatus({
        id: reportId,
        status: 'PROCESSING',
      });

      // Generate the report data
      const usageData = await this.repository.findUsageEvents({
        userId: report.userId,
        startDate: report.startDate.toISOString(),
        endDate: report.endDate.toISOString(),
      });

      // Generate the report file
      let fileContent: Buffer | string;
      let fileExtension: string;

      switch (report.format) {
        case 'CSV':
          fileContent = this.generateCsvReport(usageData);
          fileExtension = 'csv';
          break;
        case 'PDF':
          fileContent = await this.generatePdfReport(usageData);
          fileExtension = 'pdf';
          break;
        case 'JSON':
          fileContent = JSON.stringify(usageData, null, 2);
          fileExtension = 'json';
          break;
        default:
          throw new Error(`Unsupported report format: ${report.format}`);
      }

      // Prepare S3 key
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const s3Key = `${report.userId}/${reportId}-${timestamp}.${fileExtension}`;

      // Upload to S3
      await this.s3Service.saveObject(
        s3Key,
        typeof fileContent === 'string'
          ? Buffer.from(fileContent)
          : fileContent,
        this.getMimeType(report.format),
        false, // isPrivate = false (make reports publicly accessible)
      );

      // Generate download URL (adjust based on your S3 configuration)
      const downloadUrl = `${this.configService.s3.domainName}/${this.configService.s3.bucketId}/${s3Key}`;

      // Update status to completed
      await this.repository.updateReportStatus({
        id: reportId,
        status: 'COMPLETED',
        filePath: downloadUrl,
      });

      this.logger.log(`Completed report generation for job ${reportId}`);
    } catch (error: any) {
      this.logger.error(
        `Report generation failed for job ${reportId}: ${error.message}`,
      );
      await this.repository.updateReportStatus({
        id: reportId,
        status: 'FAILED',
        error: error.message,
      });
      throw error;
    }
  }

  private getMimeType(format: ReportFormat): string {
    switch (format) {
      case 'PDF':
        return 'application/pdf';
      case 'CSV':
        return 'text/csv';
      case 'JSON':
        return 'application/json';
      default:
        return 'application/octet-stream';
    }
  }

  private generateCsvReport(data: any[]): string {
    const csvRows = [];
    // Add header row
    csvRows.push(['Timestamp', 'Event Type', 'Units', 'Service', 'Metadata']);

    // Add data rows
    data.forEach((event) => {
      csvRows.push([
        event.timestamp,
        event.eventType,
        event.units,
        event.serviceId || 'N/A',
        JSON.stringify(event.metadata || {}),
      ]);
    });

    return csvRows.map((row) => row.join(',')).join('\n');
  }

  private generatePdfReport(data: any[]): Promise<Buffer> {
    // Example using pdfkit - you'll need to install it first
    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument();
    const chunks: Buffer[] = [];

    doc.fontSize(18).text('Usage Report', { align: 'center' });
    doc.moveDown();

    // Add report details
    doc.fontSize(12).text(
      `Generated on: ${new Date().toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })}`,
    );
    doc.moveDown();

    // Add usage data
    doc.fontSize(14).text('Usage Events:');
    data.forEach((event) => {
      const date = new Date(event.timestamp);

      const dateOnly = date.toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
      doc
        .fontSize(10)
        .text(`${dateOnly} - ${event.eventType}`)
        .text(`Units: ${event.units} | Service: ${event.serviceId || 'N/A'}`);
      doc.moveDown(0.5);
    });

    // Collect PDF chunks
    doc.on('data', (chunk) => chunks.push(chunk));

    return new Promise((resolve, reject) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);
      doc.end();
    });
  }

  // ========== Health Check ==========
  async healthCheck() {
    try {
      // Check database connection
      await this.repository.ping();

      // Check Redis connection
      await this.queueService.ping();

      // Check storage connection
      await this.s3Service.ping();

      return {
        status: 'OK',
        database: 'connected',
        queue: 'connected',
        storage: 'connected',
        timestamp: new Date(),
      };
    } catch (error: any) {
      this.logger.error(`Health check failed: ${error.message}`);
      throw error;
    }
  }
}
