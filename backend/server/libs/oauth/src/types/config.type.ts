import { Injectable } from '@nestjs/common';

export class OAuthServiceConfig {
  clientID: string;
  clientSecret: string;
}

export class OAuthServiceConfigWithRedirect extends OAuthServiceConfig {
  redirectURL: string;
}

@Injectable()
export class OAuthModuleConfig {
  google?: OAuthServiceConfig;
  facebook?: OAuthServiceConfig;
  vipps?: OAuthServiceConfig;
  redirectURL: string;
}

export enum OAuthProviders {
  GOOGLE = 'google',
  FACEBOOK = 'facebook',
  VIPPS = 'vipps',
}
