import {
  ApiProperty,
  IntersectionType,
  PartialType,
  PickType,
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

// ========== Core Entities ==========
export class UsageEventEntity {
  @ApiProperty({
    description: 'User ID',
    example: '95b347fc-e6e9-4753-b4a5-b617f4cc5211',
  })
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ enum: UsageEventTypeValues, example: 'API_CALL' })
  @IsEnum(UsageEventTypeValues)
  @IsNotEmpty()
  eventType: UsageEventType;

  @ApiProperty({ example: 5, minimum: 0 })
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  units: number;

  @ApiProperty({
    example: { endpoint: '/api/users', method: 'GET' },
    required: false,
  })
  @IsOptional()
  metadata?: Record<string, any>;

  @ApiProperty({ example: 'user-api', required: false })
  @IsString()
  @IsOptional()
  serviceId?: string;
}

export class UserUsageSummaryEntity {
  @ApiProperty({ example: '95b347fc-e6e9-4753-b4a5-b617f4cc5211' })
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ example: '2023-08-01T00:00:00Z' })
  @IsDateString()
  @IsNotEmpty()
  currentPeriodStart: string;

  @ApiProperty({ example: '2023-08-31T23:59:59Z' })
  @IsDateString()
  @IsNotEmpty()
  currentPeriodEnd: string;

  @ApiProperty({ example: 1250.5 })
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  totalUnits: number;

  @ApiProperty({ enum: PricingTierValues, example: 'BASIC' })
  @IsEnum(PricingTierValues)
  @IsNotEmpty()
  currentBillingPlan: PricingTier;
}

export class BillingDetailsEntity {
  @ApiProperty({ example: 29.99 })
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  baseFee: number;

  @ApiProperty({ example: 1000 })
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  includedUnits: number;

  @ApiProperty({ example: 0.01 })
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  overageRate: number;

  @ApiProperty({ example: 250 })
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  overageUnits: number;

  @ApiProperty({ example: 2.5 })
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  overageFee: number;

  @ApiProperty({ example: 32.49 })
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  totalAmount: number;
}

export class ReportRequestEntity {
  @ApiProperty({
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    required: false,
  })
  @IsString()
  @IsOptional()
  jobId?: string;

  @ApiProperty({ example: '95b347fc-e6e9-4753-b4a5-b617f4cc5211' })
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ enum: ReportFormatValues })
  @IsEnum(ReportFormatValues)
  @IsNotEmpty()
  format: ReportFormat;

  @ApiProperty({ example: new Date(Date.now()).toISOString(), required: false })
  @IsOptional()
  startDate?: Date;

  @ApiProperty({
    example: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    required: false,
  })
  @IsOptional()
  endDate?: Date;
}

export class ReportStatusEntity {
  @ApiProperty({
    example: '95b347fc-e6e9-4753-b4a5-b617f4cc5211',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  userId?: string;

  @ApiProperty({
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  jobId?: string;

  @ApiProperty({
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiProperty({ enum: ReportStatusValues, example: 'PROCESSING' })
  @IsEnum(ReportStatusValues)
  @IsNotEmpty()
  status: ReportStatus;

  @ApiProperty({ example: '2023-08-15T12:00:00Z', required: false })
  @IsDateString()
  @IsOptional()
  createdAt?: Date;

  @ApiProperty({ example: '2023-08-15T12:05:00Z', required: false })
  @IsDateString()
  @IsOptional()
  completedAt?: Date;

  @ApiProperty({
    example: '/reports/user-123-august-2023.pdf',
    required: false,
  })
  @IsString()
  @IsOptional()
  filePath?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  error?: string;
}

// ========== Derived DTOs ==========
export class CreateUsageEventDto extends UsageEventEntity {}
export class UpdateUsageEventDto extends PartialType(UsageEventEntity) {}

export class ReportRequestBodyDto extends PickType(ReportRequestEntity, [
  'format',
  'startDate',
  'endDate',
] as const) {}

export class GetUserUsageResponse extends IntersectionType(
  UserUsageSummaryEntity,
  BillingDetailsEntity,
) {}

// ========== Filter/Query DTOs ==========
export class UsageFilterEntity {
  @ApiProperty({ required: false })
  @IsUUID()
  @IsOptional()
  userId?: string;

  @ApiProperty({ enum: UsageEventTypeValues, required: false })
  @IsEnum(UsageEventTypeValues)
  @IsOptional()
  eventType?: UsageEventType;

  @ApiProperty({ example: new Date(Date.now()).toISOString(), required: false })
  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @ApiProperty({
    example: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    required: false,
  })
  @IsDateString()
  @IsNotEmpty()
  endDate: string;
}

export class PaginationEntity {
  @ApiProperty({ required: false, default: 0 })
  @IsNumber()
  @IsOptional()
  offset?: number = 0;

  @ApiProperty({ required: false, default: 10 })
  @IsNumber()
  @IsOptional()
  limit?: number = 10;
}

export class UsageQuery extends IntersectionType(
  UsageFilterEntity,
  PaginationEntity,
) {}

// ========== Response DTOs ==========
export class GenerateReportResponse {
  @ApiProperty({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  jobId: string;
}

export class HealthCheckResponse {
  @ApiProperty({ example: 'OK' })
  status: string;

  @ApiProperty({ example: 'connected' })
  database: string;

  @ApiProperty({ example: 'connected' })
  redis: string;

  @ApiProperty({ example: 12345 })
  uptime: number;
}
