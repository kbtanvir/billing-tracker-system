import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

config({ path: '.env' });

export const PG_DATABASE_URL = process.env.DATABASE_URL;

export default defineConfig({
  schema: './src/modules/drizzle/schema.ts',
  out: './src/modules/drizzle/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: PG_DATABASE_URL,
  },
});
