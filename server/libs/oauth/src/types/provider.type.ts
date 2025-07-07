import { ApiProperty } from '@nestjs/swagger';

export class OAuthProfileResponse {
  @ApiProperty()
  email: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  avatarURL: string;

  @ApiProperty()
  isEmailVerified: boolean;

  @ApiProperty()
  provider: string;

  @ApiProperty()
  id?: string;
}

export abstract class OAuthServiceProvider {
  abstract validateCode(code: string): Promise<string>;
  abstract getUserInfo(accessToken: string): Promise<OAuthProfileResponse>;
  abstract getRedirectURL(): string;
}
