export class FacebookOAuthResponse {
  access_token: string;
  token_type: string;
  expires_in: string;
}

export class FacebookProfileResponse {
  id: string;
  first_name: string;
  last_name: string;
  middle_name: string;
  name: string;
  name_format: string;
  picture: {
    data: {
      height: number;
      is_silhouette: boolean;
      url: string;
      width: number;
    };
  };

  short_name: string;
  email: string;
}

export class FacebookMeResponse {
  name: string;
  id: string;
}
