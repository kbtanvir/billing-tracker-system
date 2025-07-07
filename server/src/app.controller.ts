import { Controller, Get } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { UsageService } from './modules/usage/usage.service';

@Controller('v1/healthcheck')
export class AppController {
  constructor(private readonly usageService: UsageService) {}
  @Get()
  @ApiOperation({ summary: 'Check health of services' })
  async healthCheck() {
    return await this.usageService.healthCheck();
  }
}
