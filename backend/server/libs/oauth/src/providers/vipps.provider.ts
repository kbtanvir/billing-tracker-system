import { HttpService } from '@app/utils';
import { Base64Encode } from '@app/utils/string/base64';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import {
  OAuthProviders,
  OAuthServiceConfigWithRedirect,
} from '../types/config.type';
import {
  OAuthProfileResponse,
  OAuthServiceProvider,
} from '../types/provider.type';
import {
  VippsOAuthTokenReponse,
  VippsProfileResponse,
} from '../types/vipps.type';

@Injectable()
export class VippsOAuthProvider implements OAuthServiceProvider {
  private http = new HttpService('https://api.vipps.no/');

  constructor(private readonly config: OAuthServiceConfigWithRedirect) {}

  async validateCode(code: string): Promise<string> {
    const response = await this.http.postForm<VippsOAuthTokenReponse>(
      '/access-management-1.0/access/oauth2/token',
      {
        grant_type: 'authorization_code',
        redirect_uri: this.config.redirectURL,
        code,
      },
      {
        Authorization: `Basic ${Base64Encode(
          `${this.config.clientID}:${this.config.clientSecret}`,
        )}`,
      },
    );

    return response.access_token;
  }
  async getUserInfo(accessToken: string): Promise<OAuthProfileResponse> {
    const response = await this.http.get<VippsProfileResponse>(
      'vipps-userinfo-api/userinfo',
      {
        Authorization: `Bearer ${accessToken}`,
      },
    );

    const [firstName, lastName] = response.name?.split(' ') || ['', ''];

    if (!response.email)
      throw new InternalServerErrorException(
        'Something Went wrong when communicating with VIPPS',
      );

    return {
      email: response.email,
      isEmailVerified: response.email_verified,
      avatarURL:
        'https://vipps.no/static/vipps_frontend/619773/media/extra-images/vipps-logo.svg',
      firstName,
      lastName,
      provider: OAuthProviders.VIPPS,
    };
  }
  getRedirectURL(): string {
    const url = new URL(
      'https://api.vipps.no/access-management-1.0/access/oauth2/auth',
    );

    url.searchParams.set('client_id', this.config.clientID);
    url.searchParams.set('redirect_uri', this.config.redirectURL);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('scope', 'email name');
    url.searchParams.set(
      'state',
      Base64Encode(JSON.stringify({ provider: OAuthProviders.VIPPS })),
    );

    return url.toString();
  }
}
