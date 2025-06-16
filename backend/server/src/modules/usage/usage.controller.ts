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
  ReportRequestBodyDto,
  UsageQuery,
} from './dto/index.dto';
import { UsageService } from './usage.service';

@ApiTags('Usage')
@Controller('v1/usage')
export class UsageController {
  constructor(private readonly usageService: UsageService) {}
  @Get('users')
  @ApiOperation({ summary: 'Get users' })
  async getAllUsers() {
    return await this.usageService.getAll();
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Submit a usage event' })
  async createUsageEvent(@Body() dto: CreateUsageEventDto) {
    return await this.usageService.createUsageEvent(dto);
  }

  @Get(':userId')
  @ApiOperation({ summary: 'Get current usage and billing information' })
  async getUserUsage(@Param('userId') userId: string) {
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
  ) {
    return await this.usageService.generateReport({
      ...dto,
      userId,
    });
  }

  @Get('reports/status/:reportId')
  @ApiOperation({ summary: 'Check report generation status' })
  async getReportStatus(@Param('reportId') id: string) {
    return await this.usageService.getReportStatus(id);
  }

  @Post('billing/:userId')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Process monthly billing (admin only)' })
  async processBilling(@Param('userId') userId: string) {
    return await this.usageService.generateMonthlyBilling(userId);
  }
}
