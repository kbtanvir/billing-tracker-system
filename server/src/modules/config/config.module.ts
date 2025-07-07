import { Global, Module } from '@nestjs/common';
import { parseEnv } from 'atenv';
import { ConfigService } from './config.service';

@Global()
@Module({
  providers: [{ provide: ConfigService, useValue: parseEnv(ConfigService) }],
  exports: [ConfigService],
})
export class ConfigModule {}
