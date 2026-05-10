const { neon } = require('@neondatabase/serverless');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

async function createTestUser() {
  const sql = neon(process.env.DATABASE_URL);
  
  const email = 'test@aetheris.com';
  const password = 'test123456';
  const name = 'Test User';

  try {
    // Check if user already exists
    const existing = await sql`SELECT id FROM users WHERE email = ${email} LIMIT 1`;
    
    if (existing.length > 0) {
      console.log('✓ Test user already exists');
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    const userId = crypto.randomUUID();

    // Create user
    await sql`
      INSERT INTO users (id, email, name, verified, role, created_at, updated_at)
      VALUES (${userId}, ${email}, ${name}, true, 'student', NOW(), NOW())
    `;

    // Store password in user_passwords table
    await sql`
      INSERT INTO user_passwords (user_id, password_hash, created_at, updated_at)
      VALUES (${userId}, ${hashedPassword}, NOW(), NOW())
    `;

    console.log('✅ Test user created successfully');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createTestUser();
