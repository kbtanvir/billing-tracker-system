import {
  ApiProperty,
  IntersectionType,
  OmitType,
  PartialType,
} from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
} from 'class-validator';

// ========== Enums ==========
export const PricingTierValues = [
  'FREE',
  'BASIC',
  'PRO',
  'ENTERPRISE',
] as const;
export type PricingTier = (typeof PricingTierValues)[number];

export const ReportStatusValues = [
  'PENDING',
  'PROCESSING',
  'COMPLETED',
  'FAILED',
] as const;
export type ReportStatus = (typeof ReportStatusValues)[number];

export const ReportFormatValues = ['PDF', 'CSV', 'JSON'] as const;
export type ReportFormat = (typeof ReportFormatValues)[number];

export const UsageEventTypeValues = [
  'API_CALL',
  'STORAGE',
  'DATA_TRANSFER',
  'COMPUTE',
] as const;
export type UsageEventType = (typeof UsageEventTypeValues)[number];

// ========== Core DTOs ==========
export class UsageEventDto {
  @ApiProperty({
    description: 'User ID associated with the usage event',
    example: '95b347fc-e6e9-4753-b4a5-b617f4cc5211',
  })
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    description: 'Type of usage event',
    enum: UsageEventTypeValues,
    example: 'API_CALL',
  })
  @IsEnum(UsageEventTypeValues)
  @IsNotEmpty()
  eventType: UsageEventType;

  @ApiProperty({
    description: 'Number of units consumed',
    example: 5,
    minimum: 0,
  })
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  units: number;

  @ApiProperty({
    description: 'Optional metadata about the event',
    example: { endpoint: '/api/users', method: 'GET' },
    required: false,
  })
  @IsOptional()
  metadata?: Record<string, any>;

  @ApiProperty({
    description: 'Service identifier',
    example: 'user-api',
    required: false,
  })
  @IsString()
  @IsOptional()
  serviceId?: string;
}

export class UserUsageSummaryDto {
  @ApiProperty({
    description: 'User ID',
    example: '95b347fc-e6e9-4753-b4a5-b617f4cc5211',
  })
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    description: 'Current period start timestamp',
    example: '2023-08-01T00:00:00Z',
  })
  @IsDateString()
  @IsNotEmpty()
  currentPeriodStart: string;

  @ApiProperty({
    description: 'Current period end timestamp',
    example: '2023-08-31T23:59:59Z',
  })
  @IsDateString()
  @IsNotEmpty()
  currentPeriodEnd: string;

  @ApiProperty({
    description: 'Total units consumed in current period',
    example: 1250.5,
  })
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  totalUnits: number;

  @ApiProperty({
    description: 'Billing plan tier',
    enum: PricingTierValues,
    example: 'BASIC',
  })
  @IsEnum(PricingTierValues)
  @IsNotEmpty()
  currentBillingPlan: PricingTier;
}

export class BillingDetailsDto {
  @ApiProperty({
    description: 'Base fee for the billing plan',
    example: 29.99,
  })
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  baseFee: number;

  @ApiProperty({
    description: 'Included units in the plan',
    example: 1000,
  })
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  includedUnits: number;

  @ApiProperty({
    description: 'Overage rate per unit',
    example: 0.01,
  })
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  overageRate: number;

  @ApiProperty({
    description: 'Total overage units',
    example: 250,
  })
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  overageUnits: number;

  @ApiProperty({
    description: 'Total overage fee',
    example: 2.5,
  })
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  overageFee: number;

  @ApiProperty({
    description: 'Total amount due',
    example: 32.49,
  })
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  totalAmount: number;
}

export class ReportRequestDto {
  @ApiProperty({
    description: 'User ID for the report',
    example: '95b347fc-e6e9-4753-b4a5-b617f4cc5211',
  })
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    description: 'Report format',
    enum: ReportFormatValues,
    example: 'PDF',
  })
  @IsEnum(ReportFormatValues)
  @IsNotEmpty()
  format: ReportFormat;

  @ApiProperty({
    description: 'Start date for the report period',
    example: '2023-08-01T00:00:00Z',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiProperty({
    description: 'End date for the report period',
    example: '2023-08-31T23:59:59Z',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  endDate?: string;
}

export class ReportStatusDto {
  @ApiProperty({
    description: 'Report job ID',
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  })
  @IsUUID()
  @IsNotEmpty()
  jobId: string;

  @ApiProperty({
    description: 'Current status of the report',
    enum: ReportStatusValues,
    example: 'PROCESSING',
  })
  @IsEnum(ReportStatusValues)
  @IsNotEmpty()
  status: ReportStatus;

  @ApiProperty({
    description: 'Timestamp when the report was created',
    example: '2023-08-15T12:00:00Z',
  })
  @IsDateString()
  @IsNotEmpty()
  createdAt: string;

  @ApiProperty({
    description: 'Timestamp when the report was completed',
    example: '2023-08-15T12:05:00Z',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  completedAt?: string;

  @ApiProperty({
    description: 'Path to download the report',
    example: '/reports/user-123-august-2023.pdf',
    required: false,
  })
  @IsString()
  @IsOptional()
  downloadUrl?: string;

  @ApiProperty({
    description: 'Error message if report failed',
    required: false,
  })
  @IsString()
  @IsOptional()
  error?: string;
}

// ========== Query/Filter DTOs ==========
export class UsageFilterQuery {
  @ApiProperty({
    description: 'Filter by user ID',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  userId?: string;

  @ApiProperty({
    description: 'Filter by event type',
    enum: UsageEventTypeValues,
    required: false,
  })
  @IsEnum(UsageEventTypeValues)
  @IsOptional()
  eventType?: UsageEventType;

  @ApiProperty({
    description: 'Filter by date range (start)',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiProperty({
    description: 'Filter by date range (end)',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  endDate?: string;
}

export class PaginationQuery {
  @ApiProperty({
    description: 'Number of items to skip',
    required: false,
    default: 0,
  })
  @IsNumber()
  @IsOptional()
  offset?: number = 0;

  @ApiProperty({
    description: 'Number of items to return',
    required: false,
    default: 10,
  })
  @IsNumber()
  @IsOptional()
  limit?: number = 10;
}

export class UsageQuery extends IntersectionType(
  UsageFilterQuery,
  PaginationQuery,
) {}

// ========== Request/Response DTOs ==========
export class CreateUsageEventDto extends OmitType(UsageEventDto, [
  'userId',
] as const) {}
export class UpdateUsageEventDto extends PartialType(UsageEventDto) {}

export class GetUserUsageResponse extends IntersectionType(
  UserUsageSummaryDto,
  BillingDetailsDto,
) {}

export class GenerateReportResponse {
  @ApiProperty({
    description: 'Report job ID',
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  })
  jobId: string;
}

// ========== Health Check ==========
export class HealthCheckResponse {
  @ApiProperty({
    description: 'Service status',
    example: 'OK',
  })
  status: string;

  @ApiProperty({
    description: 'Database connection status',
    example: 'connected',
  })
  database: string;

  @ApiProperty({
    description: 'Redis connection status',
    example: 'connected',
  })
  redis: string;

  @ApiProperty({
    description: 'Uptime in seconds',
    example: 12345,
  })
  uptime: number;
}
