const pool = require('./db');

async function main() {
  try {
    const admins = await pool.query("SELECT id, full_name, email, role, employee_id, password_hash FROM public.mentors WHERE role = 'admin'");
    console.log('Admins in database:', admins.rows.map(a => ({ id: a.id, email: a.email, role: a.role, employee_id: a.employee_id, has_pwd: !!a.password_hash })));
  } catch (err) {
    console.error('Error checking admins:', err.message);
  } finally {
    await pool.end();
  }
}

main();
