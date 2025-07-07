import { ConfigurableModuleBuilder, Module } from '@nestjs/common';
import { OAuthConfigInjectionToken } from './constants';
import { OAuthService } from './oauth.service';
import { OAuthModuleConfig } from './types/config.type';

const { ConfigurableModuleClass } =
  new ConfigurableModuleBuilder<OAuthModuleConfig>({
    optionsInjectionToken: OAuthConfigInjectionToken,
  }).build();

@Module({
  providers: [OAuthService],
})
export class OAuthModule extends ConfigurableModuleClass {}
