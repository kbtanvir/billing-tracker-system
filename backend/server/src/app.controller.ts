import { Controller, Get } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { Public } from './common/decorators/public-access.decorator';

const version = '1.0.0.3';

@Controller()
export class AppController {
  @ApiOperation({ summary: `check server health - ${version}` })
  @Get('/health-check')
  @Public()
  getHello(): string {
    return 'Hello World!';
  }
}
