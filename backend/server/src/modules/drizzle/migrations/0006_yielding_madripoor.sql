ALTER TABLE "billing_periods" ALTER COLUMN "is_paid" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "billing_plans" ALTER COLUMN "included_units" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "billing_plans" ALTER COLUMN "is_active" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "reports" ALTER COLUMN "status" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "reports" ALTER COLUMN "format" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "usage_events" ALTER COLUMN "is_billed" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "user_usage_summaries" ALTER COLUMN "total_units" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "is_verified" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "is_banned" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "is_deleted" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "current_billing_plan" DROP DEFAULT;