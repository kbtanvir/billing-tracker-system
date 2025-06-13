import { Roles } from '@app/common/decorators/roles.decorator';
import { UserRole } from '@app/common/enum';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  CreateUsageEventDto,
  GenerateReportResponse,
  GetUserUsageResponse,
  ReportRequestDto,
  UsageQuery,
} from './dto/index.dto';
import { UsageService } from './users.service';

@ApiTags('Usage')
@Controller('api/v1/usage') // Added API versioning to match your requirements
export class UsageController {
  constructor(private readonly usageService: UsageService) {}

  // 1. POST /api/v1/usage - Submit usage events (sync)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Submit a usage event' })
  async createUsageEvent(@Req() req, @Body() dto: CreateUsageEventDto) {
    return await this.usageService.createUsageEvent(req.user.id, dto);
  }

  // 2. GET /api/v1/usage/{user_id} - Get current usage and billing (sync)
  @Get(':userId')
  @ApiOperation({ summary: 'Get current usage and billing information' })
  async getUserUsage(
    @Param('userId') userId: string,
  ): Promise<GetUserUsageResponse> {
    return await this.usageService.getUserUsageSummary(userId);
  }

  // Fixed: GET method with Query params instead of Body for querying events
  @Get()
  @ApiOperation({ summary: 'Query usage events' })
  async queryUsageEvents(@Req() req, @Query() query: UsageQuery) {
    return await this.usageService.getUsageEvents({
      ...query,
      userId: req.user.id,
    });
  }

  // 3. POST /api/v1/reports/{user_id} - Generate usage report (async - returns job_id)
  @Post('reports/:userId')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Generate a usage report (async)' })
  async generateReport(
    @Param('userId') userId: string,
    @Body() dto: ReportRequestDto,
  ): Promise<GenerateReportResponse> {
    return await this.usageService.generateReport({
      ...dto,
      userId,
    });
  }

  // 4. GET /api/v1/reports/status/{job_id} - Check report status (sync)
  @Get('reports/status/:jobId')
  @ApiOperation({ summary: 'Check report generation status' })
  async getReportStatus(@Param('jobId') jobId: string) {
    return await this.usageService.getReportStatus(jobId);
  }

  // Additional admin endpoint for billing
  @Post('billing/:userId')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Process monthly billing (admin only)' })
  async processBilling(@Param('userId') userId: string) {
    return await this.usageService.generateMonthlyBilling(userId);
  }
}

// Separate health controller as per best practices
@ApiTags('Health')
@Controller('api/v1')
export class HealthController {
  constructor(private readonly usageService: UsageService) {}

  // 5. GET /api/v1/health - Service health check
  @Get('health')
  @ApiOperation({ summary: 'Service health check' })
  async healthCheck() {
    return await this.usageService.healthCheck();
  }
}
