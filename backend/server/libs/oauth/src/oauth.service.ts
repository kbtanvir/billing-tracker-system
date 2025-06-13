import { Base64Decode } from '@app/utils/string/base64';
import { Injectable } from '@nestjs/common';
import { InjectOAuthConfig } from './constants';
import { FacebookOAuthProvider } from './providers/facebook.provider';
import { GoogleOAuthProvider } from './providers/google.provider';
import { VippsOAuthProvider } from './providers/vipps.provider';
import {
  OAuthModuleConfig,
  OAuthProviders,
  OAuthServiceConfigWithRedirect,
} from './types/config.type';
import {
  OAuthProfileResponse,
  OAuthServiceProvider,
} from './types/provider.type';

type ProviderClass = new (
  config: OAuthServiceConfigWithRedirect,
) => OAuthServiceProvider;

@Injectable()
export class OAuthService {
  constructor(@InjectOAuthConfig() private config: OAuthModuleConfig) {}

  private providerMap: Record<OAuthProviders, ProviderClass> = {
    [OAuthProviders.FACEBOOK]: FacebookOAuthProvider,
    [OAuthProviders.GOOGLE]: GoogleOAuthProvider,
    [OAuthProviders.VIPPS]: VippsOAuthProvider,
  };

  getRedirectURL(provider: OAuthProviders): string {
    return this.getProvider(provider).getRedirectURL();
  }

  async handleRedirect(
    code: string,
    state: string,
  ): Promise<OAuthProfileResponse> {
    const stateObj = JSON.parse(Base64Decode(state)) as {
      provider: OAuthProviders;
    };
    const { provider } = stateObj;
    const accessToken = await this.validateCode(provider, code);
    if (!accessToken) {
      throw new Error('Token not Supported');
    }
    return await this.getUserInfo(provider, accessToken);
  }

  async validateCode(provider: OAuthProviders, code: string): Promise<string> {
    return await this.getProvider(provider).validateCode(code);
  }

  private getUserInfo(
    provider: OAuthProviders,
    accessToken: string,
  ): Promise<OAuthProfileResponse> {
    return this.getProvider(provider).getUserInfo(accessToken);
  }

  private getProvider(provider: OAuthProviders): OAuthServiceProvider {
    const providerClass = this.providerMap[provider];
    const providerConfig = this.config[provider];
    if (!providerConfig) {
      throw new Error('Provider not Supported');
    }

    return new providerClass({
      ...providerConfig,
      redirectURL: this.config.redirectURL,
    });
  }
}

// https://accounts.google.com/o/oauth2/v2/auth?client_id=488295521101-hftrptko56rri5rvgd06be37bvfhuqp9.apps.googleusercontent.com&access_type=online&response_type=code&include_granted_scopes=true&scope=profile+email&state=eyJwcm92aWRlciI6Imdvb2dsZSJ9&redirect_uri=register%2Fredirect

// https://accounts.google.com/o/oauth2/v2/auth/oauthchooseaccount?client_id=674845659083-5di2715t28e58ifjm0inkjrcu936pqr6.apps.googleusercontent.com&scope=openid%20email%20profile&response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fapi%2Fauth%2Fcallback%2Fgoogle&state=kzhrpR13NdC6ZTFgoTCOXARZBzfshYhrZTg5UP9HuY4&code_challenge=pgpv8YscBO3ztgT5iNuLNWJkm7_Vwe4jAW-tIi6KKxk&code_challenge_method=S256&service=lso&o2v=2&ddm=0&flowName=GeneralOAuthFlow
