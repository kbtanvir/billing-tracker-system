import { BullModule } from '@nestjs/bull';
import { Global, Module } from '@nestjs/common';

import { ConfigService } from '../config/config.service';
import { EmailQueueName } from './constants';
import { IEMailProvider } from './interfaces/email.provider.interface';
import { MailProcessor } from './mail.processor';
import { MailService } from './mail.service';
import {
  SendgridConfig,
  SendgridProvider,
} from './providers/sendgrid.provider';

@Global()
@Module({
  imports: [
    BullModule.registerQueueAsync({
      name: EmailQueueName,
      useFactory: (config: ConfigService) => ({
        redis: {
          host: config.redis.redisHost,
          port: config.redis.redisPort,
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    MailService,
    MailProcessor,
    {
      provide: SendgridConfig,
      useFactory: (config: ConfigService): SendgridConfig => config.sendgrid,
      inject: [ConfigService],
    },
    {
      provide: IEMailProvider,
      useClass: SendgridProvider,
    },
  ],
  exports: [MailService],
})
export class MailModule {}
