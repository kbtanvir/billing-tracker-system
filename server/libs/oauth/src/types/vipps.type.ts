export class VippsOAuthTokenReponse {
  access_token: string;
  expires_in: number;
  id_token: string;
  token_type: string;
  scope: string;
}

export class Address {
  street_address: string;
  postal_code: string;
  region: string;
  country: string;
  formatted: string;
  address_type: string;
}

export class OtherAddress {
  street_address: string;
  postal_code: string;
  region: string;
  country: string;
  formatted: string;
  address_type: string;
}

export class Account {
  account_name: string;
  account_number: string;
  bank_name: string;
}

export class VippsProfileResponse {
  sub: string;
  birthdate: string;
  email: string;
  email_verified: boolean;
  nin: string;
  name: string;
  given_name: string;
  family_name: string;
  sid: string;
  phone_number: string;
  address: Address;
  other_addresses: OtherAddress[];
  accounts: Account[];
}
