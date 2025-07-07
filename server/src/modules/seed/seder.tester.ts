// src/database/seeders/usage-test-seeder.ts
import { Injectable } from '@nestjs/common';
import { DrizzleService } from '../drizzle/drizzle.service';
import { billingPlans, users, userUsageSummaries } from '../drizzle/schema';

@Injectable()
export class UsageTestSeeder {
  constructor(private readonly db: DrizzleService) {}

  async seedTestData() {
    console.log('🌱 Seeding test data...');

    // Process one entity at a time to reduce memory usage
    try {
      // 1. Billing Plans
      const freePlan = await this.upsertBillingPlan({
        name: 'Free Plan',
        tier: 'FREE',
        description: 'Free tier with basic usage',
        baseFee: '0.00',
        includedUnits: 10,
        overageRate: '0.01',
        isActive: true,
      });

      const basicPlan = await this.upsertBillingPlan({
        name: 'Basic Plan',
        tier: 'BASIC',
        description: 'Basic plan for small teams',
        baseFee: '29.99',
        includedUnits: 20,
        overageRate: '0.008',
        isActive: true,
      });

      const proPlan = await this.upsertBillingPlan({
        name: 'Pro Plan',
        tier: 'PRO',
        description: 'Professional plan for growing businesses',
        baseFee: '99.99',
        includedUnits: 50,
        overageRate: '0.005',
        isActive: true,
      });

      const plans = [freePlan, basicPlan, proPlan];
      console.log('✅ Billing plans upserted');

      // 2. Users
      const user1 = await this.upsertUser({
        email: 'testuser1@example.com',
        firstName: 'John',
        lastName: 'Doe',
        fullname: 'John Doe',
        password: '$2b$10$hashedpassword',
        currentBillingPlan: 'FREE',
        emailVerified: true,
        status: 'active',
        roleId: 'USER',
      });

      const user2 = await this.upsertUser({
        email: 'testuser2@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        fullname: 'Jane Smith',
        password: '$2b$10$hashedpassword',
        currentBillingPlan: 'BASIC',
        emailVerified: true,
        status: 'active',
        roleId: 'USER',
      });

      const user3 = await this.upsertUser({
        email: 'admin@example.com',
        firstName: 'Admin',
        lastName: 'User',
        fullname: 'Admin User',
        password: '$2b$10$hashedpassword',
        currentBillingPlan: 'PRO',
        emailVerified: true,
        status: 'active',
        roleId: 'ADMIN',
      });

      const testUsers = [user1, user2, user3];
      console.log('✅ Test users upserted');

      // 3. Usage Summaries
      const summaries = await Promise.all(
        testUsers.map((user) => this.upsertUsageSummary(user)),
      );
      console.log('✅ User usage summaries upserted');

      return { users: testUsers, plans, summaries };
    } catch (error) {
      console.error('❌ Seeding failed:', error);
      throw error;
    }
  }

  private async upsertBillingPlan(data) {
    return (
      await this.db.conn
        .insert(billingPlans)
        .values(data)
        .onConflictDoUpdate({
          target: billingPlans.tier,
          set: data,
        })
        .returning()
    )[0];
  }

  private async upsertUser(data) {
    return (
      await this.db.conn
        .insert(users)
        .values(data)
        .onConflictDoUpdate({
          target: users.email,
          set: data,
        })
        .returning()
    )[0];
  }

  private async upsertUsageSummary(user) {
    const summaryData = {
      userId: user.id,
      currentPeriodStart: new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        1,
      ),
      currentPeriodEnd: new Date(
        new Date().getFullYear(),
        new Date().getMonth() + 1,
        0,
      ),
      totalUnits: '0',
    };

    return (
      await this.db.conn
        .insert(userUsageSummaries)
        .values(summaryData)
        .onConflictDoUpdate({
          target: userUsageSummaries.userId,
          set: summaryData,
        })
        .returning()
    )[0];
  }
}
