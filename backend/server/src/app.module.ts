import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';

import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { LoggerMiddleware } from './interceptor/logger.middleware';

import { ConfigModule } from './modules/config/config.module';
import { ConfigService } from './modules/config/config.service';
import { DrizzleModule } from './modules/drizzle/drizzle.module';
import { QueueModule } from './modules/queue/queue.module';
import { RedisModule } from './modules/redis/redis.module';
import { S3Module } from './modules/s3/s3.module';
import { UsageModule } from './modules/usage/usage.module';
import { RolesGuard } from './guards/roles.guard';
import { UserRepository } from './modules/usage/users.repository';

@Module({
  imports: [
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: () => [
        {
          ttl: 60000,
          limit: 10000,
        },
      ],
    }),
    ConfigModule,
    RedisModule,
    QueueModule,
    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        transport: {
          host: config.email.smtpHost,
          port: config.email.smtpPort,
          secure: false, // true for 465, false for other ports
          auth: {
            user: config.email.smtpUser,
            pass: config.email.smtpPass,
          },
          template: {
            dir: process.cwd() + '/template/',
            adapter: new HandlebarsAdapter(), // or new PugAdapter()
            options: {
              strict: true,
            },
          },
        },
      }),
    }),

    DrizzleModule,
    UsageModule,
    S3Module,
  ],
  controllers: [AppController],
  providers: [
    UserRepository,
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes({ path: '(*)', method: RequestMethod.ALL });
  }
}
