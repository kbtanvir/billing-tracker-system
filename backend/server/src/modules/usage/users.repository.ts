// user.repository.ts
import { Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DrizzleService } from '../drizzle/drizzle.service';
import { users } from '../drizzle/schema';

@Injectable()
export class UserRepository {
  constructor(private readonly db: DrizzleService) {}

  async findById(id: string) {
    const user = await this.db.conn.query.users.findFirst({
      where: eq(users.id, id),
    });

    if (!user) {
      throw new Error(`User   not found`);
    }

    return user;
  }

  async updateBillingPlan(userId: string, plan: string) {
    await this.db.conn
      .update(users)
      .set({ currentBillingPlan: plan })
      .where(eq(users.id, userId));
  }

  getUserWithUsage(userId: string) {
    return this.db.conn.query.users.findFirst({
      where: eq(users.id, userId),
      with: {
        usageSummary: true,
        billingPeriods: {
          orderBy: (periods, { desc }) => [desc(periods.endDate)],
          limit: 12,
        },
      },
    });
  }
}
