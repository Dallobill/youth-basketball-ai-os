const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL;

const pool = new Pool({
  connectionString,
  ssl:
    process.env.NODE_ENV === 'production'
      ? { rejectUnauthorized: false }
      : false
});

async function query(text, params = []) {
  const result = await pool.query(text, params);
  return result;
}

module.exports = { query, pool };
