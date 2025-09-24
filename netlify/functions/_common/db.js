import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.PGDATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

export const query = (text, params) => pool.query(text, params);
