import { relations } from 'drizzle-orm';
import {
  boolean,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTableCreator,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

// Enums
export const pricingTierEnum = pgEnum('pricing_tier', [
  'FREE',
  'BASIC',
  'PRO',
  'ENTERPRISE',
]);
// export const reportStatusEnum = pgEnum('report_status', [
//   'PENDING',
//   'PROCESSING',
//   'COMPLETED',
//   'FAILED',
// ]);
// export const reportFormatEnum = pgEnum('report_format', ['PDF', 'CSV', 'JSON']);
export const usageEventTypeEnum = pgEnum('usage_event_type', [
  'API_CALL',
  'STORAGE',
  'DATA_TRANSFER',
  'COMPUTE',
]);

export const createTable = pgTableCreator((name) => `${name}`);

// Users table (existing)
export const users = createTable('user', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').unique(),
  firstName: text('first_name'),
  lastName: text('last_name'),
  password: text('password'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').$onUpdate(() => new Date()),
  roleId: uuid('role_id'),
  status: text('status'),
  emailVerified: boolean('is_verified'),
  isBanned: boolean('is_banned'),
  isDeleted: boolean('is_deleted'),
  fullname: text('fullname'),
  customerId: text('customer_id'),
  image: varchar('image', { length: 255 }),
  currentBillingPlan: pricingTierEnum('current_billing_plan'),
});

// Usage Events - Core table for tracking usage
export const usageEvents = createTable('usage_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, {
    onDelete: 'cascade',
  }),
  eventType: usageEventTypeEnum('event_type'),
  units: numeric('units', { precision: 15, scale: 2 }),
  timestamp: timestamp('timestamp').defaultNow(),
  metadata: jsonb('metadata'),
  serviceId: text('service_id'),
  isBilled: boolean('is_billed'),
});

// User Usage Summary (Materialized view alternative)
export const userUsageSummaries = createTable('user_usage_summaries', {
  userId: uuid('user_id')
    .primaryKey()
    .references(() => users.id, {
      onDelete: 'cascade',
    }),
  currentPeriodStart: timestamp('current_period_start').notNull().defaultNow(),
  currentPeriodEnd: timestamp('current_period_end').notNull(),
  totalUnits: numeric('total_units', { precision: 15, scale: 2 }).notNull(),
  lastUpdated: timestamp('last_updated').$onUpdate(() => new Date()),
});

// Billing Plans
export const billingPlans = createTable('billing_plans', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name'),
  tier: pricingTierEnum('tier'),
  description: text('description'),
  baseFee: numeric('base_fee', { precision: 10, scale: 2 }),
  includedUnits: integer('included_units'),
  overageRate: numeric('overage_rate', { precision: 10, scale: 4 }),
  isActive: boolean('is_active'),
});

// Reports - Fixed format field to use correct enum
export const reports = createTable('reports', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, {
    onDelete: 'cascade',
  }),
  status: text('status'),
  format: text('format').default('PDF'),
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  createdAt: timestamp('created_at').defaultNow(),
  completedAt: timestamp('completed_at'),
  filePath: text('file_path'),
  error: text('error'),
});

// Billing Periods
export const billingPeriods = createTable('billing_periods', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, {
    onDelete: 'cascade',
  }),
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  totalUnits: numeric('total_units', { precision: 15, scale: 2 }),
  baseFee: numeric('base_fee', { precision: 10, scale: 2 }),
  overageFee: numeric('overage_fee', { precision: 10, scale: 2 }),
  totalAmount: numeric('total_amount', { precision: 10, scale: 2 }),
  isPaid: boolean('is_paid'),
  invoiceId: text('invoice_id'),
});

// ===== Relations =====
export const usersRelations = relations(users, ({ one, many }) => ({
  usageEvents: many(usageEvents),
  usageSummary: one(userUsageSummaries, {
    fields: [users.id],
    references: [userUsageSummaries.userId],
  }),
  reports: many(reports),
  billingPeriods: many(billingPeriods),
  billingPlan: one(billingPlans, {
    fields: [users.currentBillingPlan],
    references: [billingPlans.tier],
  }),
}));

export const usageEventsRelations = relations(usageEvents, ({ one }) => ({
  user: one(users, {
    fields: [usageEvents.userId],
    references: [users.id],
  }),
}));

export const userUsageSummariesRelations = relations(
  userUsageSummaries,
  ({ one }) => ({
    user: one(users, {
      fields: [userUsageSummaries.userId],
      references: [users.id],
    }),
  }),
);

export const reportsRelations = relations(reports, ({ one }) => ({
  user: one(users, {
    fields: [reports.userId],
    references: [users.id],
  }),
}));

export const billingPeriodsRelations = relations(billingPeriods, ({ one }) => ({
  user: one(users, {
    fields: [billingPeriods.userId],
    references: [users.id],
  }),
}));
