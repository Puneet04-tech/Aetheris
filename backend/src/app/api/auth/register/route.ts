import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      );
    }

    const sql = neon(process.env.DATABASE_URL!);

    // Check if user already exists
    const existingUsers = await sql`SELECT id FROM users WHERE email = ${email} LIMIT 1`;

    if (existingUsers.length > 0) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const userId = crypto.randomUUID();
    await sql`
      INSERT INTO users (id, email, name, role, verified, created_at, updated_at)
      VALUES (${userId}, ${email}, ${name}, 'student', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `;

    // Store password separately in user_passwords table
    await sql`
      INSERT INTO user_passwords (user_id, password_hash, created_at, updated_at)
      VALUES (${userId}, ${hashedPassword}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `;

    // Get the created user
    const [newUser] = await sql`SELECT id, email, name, role, verified, created_at FROM users WHERE id = ${userId}`;

    return NextResponse.json(
      { message: 'User created successfully', user: newUser },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true',
    },
  });
}
