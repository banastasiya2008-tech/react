import { query } from './src/utils/db.utils.js';

async function check() {
  const users = await query('SELECT id, username, email, role, password FROM users');
  console.log('=== USERS IN DB ===');
  for (const u of users) {
    console.log(`ID:${u.id} | ${u.username} | ${u.email} | role:${u.role}`);
    console.log(`  password starts with: ${u.password.substring(0, 15)}...`);
  }
}

check().catch(console.error);