import { BullModule } from '@nestjs/bull';
import { Global, Module } from '@nestjs/common';
import Redis from 'ioredis';
import { QueueService } from './queue.service';
import { UsageModule } from '../usage/usage.module';
import { BillingProcessor, ReportProcessor } from './queue.processor';

@Global()
@Module({
  imports: [
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT, 10), // Fixed default Redis port
      },
    }),
    BullModule.registerQueue(
      {
        name: 'usage-reports',
      },
      {
        name: 'billing-jobs',
      },
      // Remove domain-management if not needed
    ),
    UsageModule,
  ],
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: () => {
        return new Redis({
          host: process.env.REDIS_HOST,
          port: parseInt(process.env.REDIS_PORT, 10),
        });
      },
    },
    QueueService,
    ReportProcessor,
    BillingProcessor,
  ],
  exports: [QueueService, 'REDIS_CLIENT'],
})
export class QueueModule {}
