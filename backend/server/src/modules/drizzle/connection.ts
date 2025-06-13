// import * as dotenv from 'dotenv';
// import { drizzle } from 'drizzle-orm/node-postgres';
// import { Pool } from 'pg';

// dotenv.config({
//   path: '.env',
// });

// const {
//   POSTGRES_USERNAME,
//   POSTGRES_PASSWORD,
//   POSTGRES_HOST,
//   POSTGRES_PORT,
//   POSTGRES_DB,
// } = process.env;

// const DATABASE_URL = `postgresql://${POSTGRES_USERNAME}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}`;

// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL,
//   // ssl: true,
//   // host: process.env.POSTGRES_HOST,
//   // port: parseInt(process.env.POSTGRES_PORT, 10),
//   // user: process.env.POSTGRES_USERNAME,
//   // password: process.env.POSTGRES_PASSWORD,
//   // database: process.env.POSTGRES_DB,
// });

// export const db = drizzle(pool);
