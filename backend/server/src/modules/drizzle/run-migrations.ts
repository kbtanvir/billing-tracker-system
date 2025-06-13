import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import * as postgres from 'postgres';
import * as dotenv from 'dotenv';

dotenv.config({
  path: '.env',
});

const sql = postgres(process.env.DATABASE_URL_MIGRATIONS, { max: 1 });
const db = drizzle(sql);
const migrateDb = async () => {
  await migrate(db, {
    migrationsFolder: 'src/modules/drizzle/migrations',
    migrationsTable: 'drizzle_migrations',
  });
  await sql.end();
  console.log('Migrations completed');
};

void migrateDb();
