import { BullModule } from '@nestjs/bull';
import { Global, Module } from '@nestjs/common';
import Redis from 'ioredis';
import { QueueService } from './queue.service';

@Global()
@Module({
  imports: [
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT, 10) || 6379, // Fixed default Redis port
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
  ],
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: () => {
        return new Redis({
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT, 10) || 6379,
        });
      },
    },
    QueueService,
    // QueueProcessor,
  ],
  exports: [QueueService, 'REDIS_CLIENT'],
})
export class QueueModule {}
