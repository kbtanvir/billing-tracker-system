import { HttpService } from '@app/utils';
import { Base64Encode } from '@app/utils/string/base64';
import { Injectable } from '@nestjs/common';
import {
  OAuthProviders,
  OAuthServiceConfigWithRedirect,
} from '../types/config.type';
import {
  FacebookOAuthResponse,
  FacebookProfileResponse,
} from '../types/facebook.type';
import {
  OAuthProfileResponse,
  OAuthServiceProvider,
} from '../types/provider.type';

@Injectable()
export class FacebookOAuthProvider implements OAuthServiceProvider {
  constructor(private readonly config: OAuthServiceConfigWithRedirect) {}

  private http = new HttpService('https://graph.facebook.com/v12.0');

  private getCodeValidationURL(code: string) {
    return `oauth/access_token?client_id=${this.config.clientID}&redirect_uri=${this.config.redirectURL}&client_secret=${this.config.clientSecret}&code=${code}`;
  }

  async validateCode(code: string): Promise<string> {
    const response2 = await this.http.get<FacebookOAuthResponse>(
      this.getCodeValidationURL(code),
    );

    return response2.access_token;
  }

  async getUserInfo(accessToken: string): Promise<OAuthProfileResponse> {
    const details = await this.http.get<FacebookProfileResponse>(
      `me?fields=id,email,name,first_name,last_name,picture&access_token=${accessToken}`,
    );
    const {
      first_name: firstName,
      last_name: lastName,
      email,
      picture,
    } = details;

    return {
      avatarURL: picture.data.url,
      isEmailVerified: true,
      email,
      firstName,
      lastName,
      provider: OAuthProviders.FACEBOOK,
    };
  }

  getRedirectURL() {
    const url = new URL('https://www.facebook.com/v12.0/dialog/oauth');

    url.searchParams.set('client_id', this.config.clientID);

    url.searchParams.set('response_type', 'code');
    url.searchParams.set('scope', 'email,public_profile');
    url.searchParams.set(
      'state',
      Base64Encode(JSON.stringify({ provider: OAuthProviders.FACEBOOK })),
    );
    url.searchParams.set('redirect_uri', this.config.redirectURL);

    return url.toString();
  }
}
