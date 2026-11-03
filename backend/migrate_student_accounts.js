const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
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

async function main() {
  console.log('--- Running Student Account Migration ---');
  
  // 1. Add account_status column
  await pool.query(`
    ALTER TABLE public.mentees 
    ADD COLUMN IF NOT EXISTS account_status VARCHAR(30) DEFAULT 'not_activated';
  `);
  console.log('✓ Added or verified column account_status');

  // 2. Add must_change_password column
  await pool.query(`
    ALTER TABLE public.mentees 
    ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN DEFAULT false;
  `);
  console.log('✓ Added or verified column must_change_password');

  // 3. Update existing records with password_hash to active
  const activeRes = await pool.query(`
    UPDATE public.mentees 
    SET account_status = 'active' 
    WHERE password_hash IS NOT NULL AND (account_status IS NULL OR account_status = 'not_activated');
  `);
  console.log(`✓ Updated ${activeRes.rowCount} mentees with existing password to 'active'`);

  // 4. Update records with NULL password_hash to not_activated
  const notActRes = await pool.query(`
    UPDATE public.mentees 
    SET account_status = 'not_activated' 
    WHERE password_hash IS NULL;
  `);
  console.log(`✓ Updated ${notActRes.rowCount} mentees with NULL password to 'not_activated'`);

  // 5. Verify Mahi Sharma
  const mahiRes = await pool.query(`
    SELECT id, full_name, roll_number, email, account_status, must_change_password, 
           CASE WHEN password_hash IS NULL THEN 'NULL' ELSE 'HASHED' END as pwd_state
    FROM public.mentees 
    WHERE roll_number = 'A60205224158';
  `);
  console.log('Mahi Sharma current status:', mahiRes.rows[0]);

  // 6. Summary of all mentees
  const summaryRes = await pool.query(`
    SELECT account_status, COUNT(*) as count 
    FROM public.mentees 
    GROUP BY account_status;
  `);
  console.log('Account status summary:', summaryRes.rows);

  await pool.end();
  process.exit(0);
}

main().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});

