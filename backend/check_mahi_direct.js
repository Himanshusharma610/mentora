const pool = require('./db');

async function main() {
  try {
    const res = await pool.query("SELECT * FROM public.mentees WHERE roll_number = 'A60205224158' OR admission_number = 'A60205224158' OR full_name ILIKE '%Mahi%'");
    console.log('Mahi rows:', res.rows);
    const cols = await pool.query("SELECT column_name, data_type, column_default FROM information_schema.columns WHERE table_name = 'mentees'");
    console.log('Columns of mentees:', cols.rows.map(c => c.column_name));
  } catch (err) {
    console.error('Error querying student:', err.message);
  } finally {
    await pool.end();
  }
}

main();
