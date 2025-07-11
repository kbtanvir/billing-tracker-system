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
  ReportRequestEntity,
  ReportStatusEntity,
  UpdateUsageEventDto,
  UsageQuery,
} from './dto/index.dto';

@Injectable()
export class UsageRepository {
  constructor(private readonly db: DrizzleService) {}

  async ping(): Promise<boolean> {
    try {
      const result = await this.db.conn.execute<{ one: number }>(
        sql`SELECT 1 as one`,
      );
      return result.rows[0]?.one === 1;
    } catch (error) {
      console.error('Database ping failed:', error);
      return false;
    }
  }

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

  async resetUsageSummary(userId: string) {
    // Start a transaction to ensure all operations succeed or fail together
    await this.db.conn.transaction(async (tx) => {
      // Delete all usage events for the user
      await tx
        .delete(usageEvents)
        .where(eq(usageEvents.userId, userId))
        .execute();

      // Delete all reports for the user
      await tx.delete(reports).where(eq(reports.userId, userId)).execute();

      await tx
        .delete(billingPeriods)
        .where(eq(reports.userId, userId))
        .execute();

      // Reset the user's usage summary
      const summary = await tx.query.userUsageSummaries.findFirst({
        where: eq(userUsageSummaries.userId, userId),
      });

      if (summary) {
        await tx
          .update(userUsageSummaries)
          .set({
            totalUnits: '0',
            currentPeriodStart: new Date(), // reset to current date
            currentPeriodEnd: this.getNextPeriodEndDate(new Date()),
          })
          .where(eq(userUsageSummaries.userId, userId))
          .execute();
      } else {
        // Create a new summary if one doesn't exist
        await tx
          .insert(userUsageSummaries)
          .values({
            userId,
            totalUnits: '0',
            currentPeriodStart: new Date(),
            currentPeriodEnd: this.getNextPeriodEndDate(new Date()),
          })
          .execute();
      }
    });
  }

  private async ensureUserUsageSummaryExists(userId: string) {
    const exists = await this.db.conn.query.userUsageSummaries.findFirst({
      where: eq(userUsageSummaries.userId, userId),
    });
    const summary = await this.getUserUsageSummary(userId);

    if (!exists) {
      await this.db.conn
        .insert(userUsageSummaries)
        .values({
          userId,
          currentPeriodStart: summary.currentPeriodStart,
          currentPeriodEnd: this.getNextPeriodEndDate(summary.currentPeriodEnd),
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
  async createReportJob(dto: ReportRequestEntity) {
    const [report] = await this.db.conn.insert(reports).values(dto).returning();

    return report;
  }

  async getReportStatus(id: string) {
    const report = await this.db.conn.query.reports.findFirst({
      where: eq(reports.id, id),
    });

    if (!report) {
      throw new Error('Report not found');
    }

    return report;
  }

  async updateReportStatus(dto: ReportStatusEntity) {
    const [item] = await this.db.conn
      .update(reports)
      .set({
        ...dto,
        completedAt:
          dto.status === 'COMPLETED' || dto.status === 'FAILED'
            ? new Date()
            : undefined,
      })
      .where(eq(reports.id, dto.id))
      .returning();

    return item;
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

    // Calculate billing details
    const includedUnits = Number(billingPlan.includedUnits);
    const usedUnits = Number(summary.totalUnits);
    const overageUnits = Math.max(0, usedUnits - includedUnits);
    const overageFee = overageUnits * Number(billingPlan.overageRate);
    const totalAmount = Number(billingPlan.baseFee) + overageFee;

    const [period] = await this.db.conn
      .insert(billingPeriods)
      .values({
        userId,
        startDate: summary.currentPeriodStart,
        endDate: summary.currentPeriodEnd,
        totalUnits: summary.totalUnits,
        baseFee: billingPlan.baseFee,
        overageFee: overageFee.toString(),
        totalAmount: totalAmount.toString(),
      })
      .returning();

    // Reset usage for new period
    await this.db.conn
      .update(userUsageSummaries)
      .set({
        currentPeriodStart: summary.currentPeriodEnd,
        currentPeriodEnd: this.getNextPeriodEndDate(summary.currentPeriodEnd),
        totalUnits: '0',
      })
      .where(eq(userUsageSummaries.userId, userId))
      .execute();

    return {
      success: true,
      invoiceId: period.id,
      startDate: period.startDate,
      endDate: period.endDate,
      totalAmount,
      overageFee,
      baseFee: Number(billingPlan.baseFee),
      usedUnits,
      includedUnits,
    };
  }

  private getNextPeriodEndDate(startDate: Date): Date {
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);
    // If we crossed a year boundary, adjust the year
    if (endDate.getMonth() === 0 && startDate.getMonth() === 11) {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }
    // Set to last moment of the day
    endDate.setHours(23, 59, 59, 999);
    return endDate;
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
