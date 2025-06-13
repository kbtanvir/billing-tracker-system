import { Global, Module } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/node-postgres';
import { PG_DATABASE_URL } from 'drizzle.config';
import { Pool } from 'pg';
import { PG_CONNECTION } from '../../common/constant/pg-connection';
import { ConfigService } from '../config/config.service';
import { DrizzleService } from './drizzle.service';
import * as schema from './schema';

@Global()
@Module({
  providers: [
    {
      provide: PG_CONNECTION,
      inject: [ConfigService],
      useFactory: () => {
        const pool = new Pool({
          connectionString: PG_DATABASE_URL,
        });

        return drizzle(pool, { schema });
      },
    },
    DrizzleService,
  ],
  exports: [DrizzleService],
})
export class DrizzleModule {}
