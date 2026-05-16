const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

async function checkTables() {
  const sql = neon(process.env.DATABASE_URL);
  try {
    const tables = await sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`;
    console.log('Tables in DB:', tables.map(t => t.table_name));
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkTables();
