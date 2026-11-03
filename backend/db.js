require('dotenv').config();
const { Pool } = require('pg');

const dbSslConfig = process.env.DB_SSL === 'true'
  ? { rejectUnauthorized: false }
  : process.env.DB_SSL === 'false'
    ? false
    : (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('sslmode=disable') && !process.env.DATABASE_URL.includes('localhost') && !process.env.DATABASE_URL.includes('127.0.0.1')) ||
      (process.env.DB_HOST && process.env.DB_HOST !== 'localhost' && process.env.DB_HOST !== '127.0.0.1')
      ? { rejectUnauthorized: false }
      : false;

const poolConfig = process.env.DATABASE_URL
  ? {
    connectionString: process.env.DATABASE_URL,
    ssl: dbSslConfig,
  }
  : {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 5432),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: dbSslConfig,
  };

const pool = new Pool(poolConfig);

async function testConnection() {
  try {
    const result = await pool.query('SELECT NOW() AS current_time');
    console.log('Database connected successfully!');
    console.log(result.rows[0]);
  } catch (error) {
    console.error('Database connection failed:', error.message);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  testConnection();
}

module.exports = pool;
