// lib/db.js
import pkg from 'pg';
const { Pool } = pkg;

let pool;

if (!global.__pgPool) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
  global.__pgPool = pool;
} else {
  pool = global.__pgPool;
}

export async function query(text, params) {
  const client = await pool.connect();
  try {
    return await client.query(text, params);
  } finally {
    client.release();
  }
}
