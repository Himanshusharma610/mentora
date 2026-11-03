const pool = require('./db');

async function main() {
  try {
    const r = await pool.query(`
      UPDATE public.mentees 
      SET password_hash = NULL, account_status = 'not_activated', must_change_password = false 
      WHERE roll_number = 'A60205224158'
      RETURNING id, full_name, roll_number, email, account_status, must_change_password, password_hash
    `);
    console.log('Mahi Sharma is set to:', r.rows[0]);
  } catch (err) {
    console.error('Error updating student:', err.message);
  } finally {
    await pool.end();
  }
}

main();
