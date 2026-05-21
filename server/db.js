import pg from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';

const { Pool } = pg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: Number(process.env.DB_POOL_MAX || 10),
});

export const db = drizzle(pool);

export async function query(sql, params = []) {
  const result = await pool.query(sql, params);
  return result;
}
