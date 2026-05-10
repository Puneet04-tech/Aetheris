import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password || !name) {
      const response = NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      );
      response.headers.set('Access-Control-Allow-Origin', '*');
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      return response;
    }

    const sql = neon(process.env.DATABASE_URL!);

    // Check if user already exists
    const existingUsers = await sql`SELECT id FROM users WHERE email = ${email} LIMIT 1`;

    if (existingUsers.length > 0) {
      const response = NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
      response.headers.set('Access-Control-Allow-Origin', '*');
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      return response;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const userId = crypto.randomUUID();
    await sql`
      INSERT INTO users (id, email, name, role, verified, created_at, updated_at, password_hash)
      VALUES (${userId}, ${email}, ${name}, 'student', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, ${hashedPassword})
    `;

    // Get the created user
    const [newUser] = await sql`SELECT id, email, name, role, verified, created_at FROM users WHERE id = ${userId}`;

    const response = NextResponse.json(
      { message: 'User created successfully', user: newUser },
      { status: 201 }
    );
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return response;
  } catch (error) {
    console.error('Registration error:', error);
    const response = NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return response;
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
