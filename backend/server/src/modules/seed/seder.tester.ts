// src/database/seeders/usage-test-seeder.ts
import { Injectable } from '@nestjs/common';
import { DrizzleService } from '../drizzle/drizzle.service';
import { billingPlans, users, userUsageSummaries } from '../drizzle/schema';

@Injectable()
export class UsageTestSeeder {
  constructor(private readonly db: DrizzleService) {}

  async seedTestData() {
    console.log('🌱 Seeding test data...');

    // 1. Create billing plans
    const plans = await this.db.conn
      .insert(billingPlans)
      .values([
        {
          name: 'Free Plan',
          tier: 'FREE',
          description: 'Free tier with basic usage',
          baseFee: '0.00',
          includedUnits: 1000,
          overageRate: '0.01',
          isActive: true,
        },
        {
          name: 'Basic Plan',
          tier: 'BASIC',
          description: 'Basic plan for small teams',
          baseFee: '29.99',
          includedUnits: 10000,
          overageRate: '0.008',
          isActive: true,
        },
        {
          name: 'Pro Plan',
          tier: 'PRO',
          description: 'Professional plan for growing businesses',
          baseFee: '99.99',
          includedUnits: 50000,
          overageRate: '0.005',
          isActive: true,
        },
      ])
      .returning();

    console.log('✅ Billing plans created');

    // 2. Create test users
    const testUsers = await this.db.conn
      .insert(users)
      .values([
        {
          email: 'testuser1@example.com',
          firstName: 'John',
          lastName: 'Doe',
          fullname: 'John Doe',
          password: '$2b$10$hashedpassword', // Use proper hashing in real app
          currentBillingPlan: 'FREE',
          emailVerified: true,
          status: 'active',
        },
        {
          email: 'testuser2@example.com',
          firstName: 'Jane',
          lastName: 'Smith',
          fullname: 'Jane Smith',
          password: '$2b$10$hashedpassword',
          currentBillingPlan: 'BASIC',
          emailVerified: true,
          status: 'active',
        },
        {
          email: 'admin@example.com',
          firstName: 'Admin',
          lastName: 'User',
          fullname: 'Admin User',
          password: '$2b$10$hashedpassword',
          currentBillingPlan: 'PRO',
          emailVerified: true,
          status: 'active',
        },
      ])
      .returning();

    console.log('✅ Test users created');

    // 3. Create usage summaries for users
    const summaries = await this.db.conn
      .insert(userUsageSummaries)
      .values(
        testUsers.map((user) => ({
          userId: user.id,
          currentPeriodStart: new Date(
            new Date().getFullYear(),
            new Date().getMonth(),
            1,
          ).toISOString(),
          currentPeriodEnd: new Date(
            new Date().getFullYear(),
            new Date().getMonth() + 1,
            0,
          ).toISOString(),
          totalUnits: '0',
        })),
      )
      .returning();

    console.log('✅ User usage summaries created');

    return {
      users: testUsers,
      plans,
      summaries,
    };
  }

  async clearTestData() {
    console.log('🧹 Clearing test data...');

    // Clear in reverse order due to foreign key constraints
    await this.db.conn.delete(userUsageSummaries);
    await this.db.conn.delete(users);
    await this.db.conn.delete(billingPlans);

    console.log('✅ Test data cleared');
  }
}
