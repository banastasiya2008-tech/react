import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function query(text: string, params?: any[]) {
  const result = await pool.query(text, params);
  return result.rows;
}

export async function queryOne(text: string, params?: any[]) {
  const rows = await query(text, params);
  return rows[0] || null;
}

export async function exec(text: string, params?: any[]) {
  const result = await pool.query(text, params);
  return { rowCount: result.rowCount || 0, lastID: result.rows[0]?.id };
}

export default pool;