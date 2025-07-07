import { Injectable } from '@nestjs/common';
import { Env, Section } from 'atenv';
import { Transform } from 'class-transformer';
import { IsDefined, IsOptional } from 'class-validator';

class S3Service {
  @Env('S3_ACCESS_KEY')
  // @IsOptional()
  accessKey: string;

  @Env('S3_SECRET_KEY')
  // @IsOptional()
  secretKey: string;

  @Env('S3_BUCKET_ID')
  // @IsOptional()
  bucketId: string;

  @Env('S3_DOMAIN_NAME')
  @IsOptional()
  domainName: string;
  @Env('S3_ENDPOINT')
  // @IsOptional()
  endpoint: string;
}

class Email {
  @IsOptional()
  @Env('SMTP_HOST')
  smtpHost: string;

  @IsOptional()
  @Env('SMTP_PORT')
  smtpPort: number;

  @IsOptional()
  @Env('SMTP_USER')
  smtpUser: string;

  @IsOptional()
  @Env('SMTP_PASS')
  smtpPass: string;

  @IsOptional()
  @Env('MAIL_SEND_FROM')
  mailSendFrom: string;
}

class Sendgrid {
  @IsOptional()
  @Env('SENDGRID_API_KEY')
  apiKey: string;

  @IsOptional()
  @Env('MAIL_SEND_FROM')
  mailSendFrom: string;
}

class JWTsettings {
  @IsDefined({ message: 'JWT  secret is required in .env file' })
  @Env('JWT_SECRET')
  secret: string;

  @IsDefined({
    message: 'JWT access token `expires in` is required in .env file',
  })
  @Env('JWT_ACCESS_TOKEN_EXPIRES_IN')
  accessTokenExpiresIn: string;

  @IsDefined({
    message: 'JWT refresh token `expires in` is required in .env file',
  })
  @Env('JWT_REFRESH_TOKEN_EXPIRES_IN')
  refreshTokenExpiresIn: string;
}

class Redis {
  @IsOptional()
  @Env('REDIS_HOST')
  redisHost: string;

  @IsOptional()
  @Env('REDIS_PORT')
  redisPort: number;
}

class Facebook {
  @IsOptional({ message: 'Facebook client id is required in .env file' })
  @Env('FACEBOOK_CLIENT_ID')
  clientId: string;

  @IsOptional({ message: 'Facebook client secret is required in .env file' })
  @Env('FACEBOOK_CLIENT_SECRET')
  clientSecret: string;
}

class Google {
  @IsDefined({ message: 'Facebook client id is required in .env file' })
  @Env('GOOGLE_CLIENT_ID')
  clientId: string;

  @IsDefined({ message: 'Facebook client secret is required in .env file' })
  @Env('GOOGLE_CLIENT_SECRET')
  clientSecret: string;
}

class Stripe {
  @IsDefined({ message: 'R2 CDN URL is required in the .env file' })
  @Env('STRIPE_SECRET_KEY')
  secretKey: string;
}

@Injectable()
export class ConfigService {
  @Env('APP_PORT')
  @Transform(({ value }) => parseInt(value) || 3333)
  port = 3333;

  @Env('DATABASE_URL')
  dbURL = 'mongodb://0.0.0.0:27017/auth';

  @Env('STREX_SMS_RECEIVE_SECRET')
  strexSMSReceiveSecret: string;

  @Section(() => JWTsettings)
  jwt: JWTsettings;

  @Section(() => Redis)
  redis: Redis;

  @Section(() => Email)
  email: Email;

  @Section(() => Sendgrid)
  sendgrid: Sendgrid;

  @Section(() => S3Service)
  s3: S3Service;

  @Section(() => Facebook)
  facebook: Facebook;

  @Section(() => Google)
  google: Google;

  // @Section(() => Cloudflare)
  // cloudflare: Cloudflare;

  @Section(() => Stripe)
  stripe: Stripe;

  @IsOptional()
  @Env('FRONTEND_URL')
  frontendUrl: string;

  @Env('AUTH_REDIRECT_URL')
  authRedirectURL: string;

  @Env('NODE_ENV')
  nodeEnv: string;

  isProd() {
    return this.nodeEnv === 'production';
  }
}
