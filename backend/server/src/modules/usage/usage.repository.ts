import { Injectable } from '@nestjs/common';
import { and, asc, between, eq, gte, lte, sql } from 'drizzle-orm';
import { DrizzleService } from '../drizzle/drizzle.service';
import {
  billingPeriods,
  billingPlans,
  reports,
  usageEvents,
  userUsageSummaries,
} from '../drizzle/schema';
import {
  CreateUsageEventDto,
  ReportRequestDto,
  ReportStatus,
  UpdateUsageEventDto,
  UsageQuery,
} from './dto/index.dto';

@Injectable()
export class UsageRepository {
  constructor(private readonly db: DrizzleService) {}

  // ========== Usage Events ==========
  async createUsageEvent(dto: CreateUsageEventDto & { userId: string }) {
    const [event] = await this.db.conn
      .insert(usageEvents)
      .values({
        userId: dto.userId,
        eventType: dto.eventType,
        units: dto.units.toString(), // Ensure numeric is stored as string
        metadata: dto.metadata,
        serviceId: dto.serviceId,
      })
      .returning();

    // Update user usage summary after creating event
    await this.incrementUserUsage(dto.userId, Number(dto.units));

    return event;
  }

  async updateUsageEvent(id: string, dto: UpdateUsageEventDto) {
    return await this.db.conn
      .update(usageEvents)
      .set({
        ...dto,
        units: dto.units ? dto.units.toString() : undefined, // Handle numeric conversion
      })
      .where(eq(usageEvents.id, id))
      .returning();
  }

  async findUsageEvents(query: UsageQuery) {
    const conditions = [];

    if (query.userId) {
      conditions.push(eq(usageEvents.userId, query.userId));
    }

    if (query.eventType) {
      conditions.push(eq(usageEvents.eventType, query.eventType));
    }

    if (query.startDate && query.endDate) {
      conditions.push(
        between(
          usageEvents.timestamp,
          new Date(query.startDate),
          new Date(query.endDate),
        ),
      );
    } else if (query.startDate) {
      conditions.push(gte(usageEvents.timestamp, new Date(query.startDate)));
    } else if (query.endDate) {
      conditions.push(lte(usageEvents.timestamp, new Date(query.endDate)));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    return await this.db.conn
      .select()
      .from(usageEvents)
      .where(whereClause)
      .offset(query.offset ?? 0)
      .limit(query.limit ?? 10)
      .orderBy(asc(usageEvents.timestamp));
  }

  // ========== User Usage Summary ==========
  async getUserUsageSummary(userId: string) {
    // First ensure user usage summary exists
    await this.ensureUserUsageSummaryExists(userId);

    const summary = await this.db.conn.query.userUsageSummaries.findFirst({
      where: eq(userUsageSummaries.userId, userId),
      with: {
        user: {
          columns: {
            currentBillingPlan: true,
          },
        },
      },
    });
    const report = await this.db.conn.query.reports.findFirst({
      where: eq(reports.userId, userId),
    });

    if (!summary) {
      throw new Error('User usage summary not found');
    }

    const billingPlan = await this.db.conn.query.billingPlans.findFirst({
      where: eq(billingPlans.tier, summary.user.currentBillingPlan),
    });

    if (!billingPlan) {
      throw new Error('Billing plan not found');
    }

    const totalUnits = Number(summary.totalUnits);
    const includedUnits = billingPlan.includedUnits || 0;
    const overageUnits = Math.max(0, totalUnits - includedUnits);
    const overageRate = Number(billingPlan.overageRate) || 0;
    const overageFee = overageUnits * overageRate;
    const baseFee = Number(billingPlan.baseFee) || 0;
    const totalAmount = baseFee + overageFee;

    return {
      userId: summary.userId,
      currentPeriodStart: summary.currentPeriodStart,
      currentPeriodEnd: summary.currentPeriodEnd,
      totalUnits: Number(summary.totalUnits),
      currentBillingPlan: summary.user.currentBillingPlan as any,
      baseFee,
      includedUnits,
      overageRate,
      overageUnits,
      overageFee,
      totalAmount,
      jobId: report?.id,
    };
  }

  private async ensureUserUsageSummaryExists(userId: string) {
    const exists = await this.db.conn.query.userUsageSummaries.findFirst({
      where: eq(userUsageSummaries.userId, userId),
    });

    if (!exists) {
      await this.db.conn
        .insert(userUsageSummaries)
        .values({
          userId,
          currentPeriodEnd: this.getNextPeriodEndDate(),
          totalUnits: '0',
        })
        .execute();
    }
  }

  async incrementUserUsage(userId: string, units: number) {
    // Ensure user usage summary exists first
    await this.ensureUserUsageSummaryExists(userId);

    await this.db.conn
      .update(userUsageSummaries)
      .set({
        totalUnits: sql`${userUsageSummaries.totalUnits} + ${units}`,
      })
      .where(eq(userUsageSummaries.userId, userId))
      .execute();
  }

  // ========== Reports ==========
  async createReportJob(dto: ReportRequestDto) {
    const [report] = await this.db.conn
      .insert(reports)
      .values({
        ...dto,
        status: 'PENDING',
      })
      .returning();

    return { jobId: report.id };
  }

  async getReportStatus(jobId: string) {
    const report = await this.db.conn.query.reports.findFirst({
      where: eq(reports.id, jobId),
    });

    if (!report) {
      throw new Error('Report not found');
    }

    return report;
  }

  async updateReportStatus(
    jobId: string,
    status: ReportStatus,
    filePath?: string,
    error?: string,
  ) {
    await this.db.conn
      .update(reports)
      .set({
        status,
        filePath,
        error,
        completedAt:
          status === 'COMPLETED' || status === 'FAILED'
            ? new Date()
            : undefined,
      })
      .where(eq(reports.id, jobId))
      .execute();
  }

  // ========== Billing Periods ==========
  async createBillingPeriod(userId: string) {
    const summary = await this.getUserUsageSummary(userId);
    const billingPlan = await this.db.conn.query.billingPlans.findFirst({
      where: eq(billingPlans.tier, summary.currentBillingPlan),
    });

    if (!billingPlan) {
      throw new Error('Billing plan not found');
    }

    const [period] = await this.db.conn
      .insert(billingPeriods)
      .values({
        userId,
        startDate: summary.currentPeriodStart,
        endDate: summary.currentPeriodEnd,
        totalUnits: summary.totalUnits, // Ensure numeric is string
        baseFee: billingPlan.baseFee,
        overageFee: summary.overageFee, // Convert to string
        totalAmount: summary.totalAmount, // Convert to string
      })
      .returning();

    // Reset the user's usage summary for new period
    await this.db.conn
      .update(userUsageSummaries)
      .set({
        currentPeriodEnd: this.getNextPeriodEndDate(),
        totalUnits: '0', // Reset as string
      })
      .where(eq(userUsageSummaries.userId, userId))
      .execute();

    return period;
  }

  private getNextPeriodEndDate(): Date {
    const date = new Date();
    date.setMonth(date.getMonth() + 1);
    date.setDate(0); // Last day of next month
    date.setHours(23, 59, 59, 999);
    return date;
  }

  // ========== Additional Helper Methods ==========
  async getUserById(userId: string) {
    return await this.db.conn.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, userId),
    });
  }

  async getBillingPlanByTier(tier: string) {
    return await this.db.conn.query.billingPlans.findFirst({
      where: eq(billingPlans.tier, tier as any),
    });
  }

  // Method to get user reports
  async getUserReports(userId: string, limit = 10, offset = 0) {
    return await this.db.conn.query.reports.findMany({
      where: eq(reports.userId, userId),
      limit,
      offset,
      orderBy: (reports, { desc }) => [desc(reports.createdAt)],
    });
  }
}
