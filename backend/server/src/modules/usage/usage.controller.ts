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
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  CreateUsageEventDto,
  GenerateReportResponse,
  GetUserUsageResponse,
  ReportRequestBodyDto,
  UsageQuery,
} from './dto/index.dto';
import { UsageService } from './usage.service';

@ApiTags('Usage')
@Controller('usage')
export class UsageController {
  constructor(private readonly usageService: UsageService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Submit a usage event' })
  async createUsageEvent(@Body() dto: CreateUsageEventDto) {
    return await this.usageService.createUsageEvent(dto);
  }

  @Get(':userId')
  @ApiOperation({ summary: 'Get current usage and billing information' })
  async getUserUsage(
    @Param('userId') userId: string,
  ): Promise<GetUserUsageResponse> {
    return await this.usageService.getUserUsageSummary(userId);
  }

  @Get()
  @ApiOperation({ summary: 'Query usage events' })
  async queryUsageEvents(@Query() query: UsageQuery) {
    return await this.usageService.getUsageEvents(query);
  }

  @Post('reports/:userId')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Generate a usage report (async)' })
  async generateReport(
    @Param('userId') userId: string,
    @Body() dto: ReportRequestBodyDto,
  ): Promise<GenerateReportResponse> {
    return await this.usageService.generateReport({
      ...dto,
      userId,
    });
  }

  @Get('reports/status/:jobId')
  @ApiOperation({ summary: 'Check report generation status' })
  async getReportStatus(@Param('jobId') jobId: string) {
    return await this.usageService.getReportStatus(jobId);
  }

  @Post('billing/:userId')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Process monthly billing (admin only)' })
  async processBilling(@Param('userId') userId: string) {
    return await this.usageService.generateMonthlyBilling(userId);
  }
}

@ApiTags('Health')
@Controller('api/v1')
export class HealthController {
  constructor(private readonly usageService: UsageService) {}

  @Get('health')
  @ApiOperation({ summary: 'Service health check' })
  async healthCheck() {
    return await this.usageService.healthCheck();
  }
}
