import { HttpService } from '@app/utils';
import { Base64Encode } from '@app/utils/string/base64';
import { BadRequestException, Injectable } from '@nestjs/common';
import {
  OAuthProviders,
  OAuthServiceConfigWithRedirect,
} from '../types/config.type';
import {
  GoogleOAuthResponse,
  GoogleProfileResponse,
} from '../types/google.type';
import {
  OAuthProfileResponse,
  OAuthServiceProvider,
} from '../types/provider.type';

@Injectable()
export class GoogleOAuthProvider implements OAuthServiceProvider {
  constructor(private readonly config: OAuthServiceConfigWithRedirect) {}

  private http = new HttpService('https://oauth2.googleapis.com');
  private googleAPI = new HttpService('https://www.googleapis.com');

  async validateCode(code: string): Promise<string> {
    const response = await this.http.postForm<GoogleOAuthResponse>('token', {
      client_id: this.config.clientID,
      client_secret: this.config.clientSecret,
      code,
      redirect_uri: `${this.config.redirectURL}`,
      grant_type: 'authorization_code',
    });

    if (response.access_token) {
      return response.access_token;
    }
    throw new BadRequestException('Invalid code');
  }

  async getUserInfo(accessToken: string): Promise<OAuthProfileResponse> {
    const details = await this.googleAPI.get<GoogleProfileResponse>(
      'oauth2/v2/userinfo',
      {
        Authorization: `Bearer ${accessToken}`,
      },
    );

    const { name, verified_email, email, picture } = details;
    const [firstName, lastName] = name.split(' ');

    return {
      avatarURL: picture,
      isEmailVerified: verified_email,
      firstName,
      lastName,
      email,
      provider: OAuthProviders.GOOGLE,
      id: details.id,
    };
  }

  getRedirectURL() {
    const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');

    url.searchParams.set('client_id', this.config.clientID);
    url.searchParams.set('access_type', 'online');
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('include_granted_scopes', 'true');
    url.searchParams.set('scope', 'profile email');
    url.searchParams.set(
      'state',
      Base64Encode(JSON.stringify({ provider: OAuthProviders.GOOGLE })),
    );

    url.searchParams.set('redirect_uri', this.config.redirectURL);

    return url.toString();
  }
}
