import { Inject } from '@nestjs/common';

export const OAuthConfigInjectionToken = 'OAuthConfigInjectionToken';

export const InjectOAuthConfig = () => Inject(OAuthConfigInjectionToken);
