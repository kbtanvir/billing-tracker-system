import { Inject } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { PG_CONNECTION } from '../../common/constant/pg-connection';
import * as schema from './schema';

export class DrizzleService {
  constructor(
    @Inject(PG_CONNECTION) readonly conn: NodePgDatabase<typeof schema>,
  ) {}
}
