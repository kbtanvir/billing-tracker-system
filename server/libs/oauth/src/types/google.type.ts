export class GoogleOAuthResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
  refresh_token: string;
}

export class GoogleProfileResponse {
  family_name: string;
  name: string;
  picture: string;
  locale: string;
  email: string;
  given_name: string;
  id: string;
  verified_email: boolean;
}
