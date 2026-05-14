import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    console.log('[REGISTER] Received registration request');
    const { email, password, name } = await request.json();

    console.log('[REGISTER] Email:', email, 'Name:', name);

    if (!email || !password || !name) {
      console.log('[REGISTER] Missing required fields');
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
    console.log('[REGISTER] Checking if user already exists');

    // Check if user already exists
    const existingUsers = await sql`SELECT id FROM users WHERE email = ${email} LIMIT 1`;

    if (existingUsers.length > 0) {
      console.log('[REGISTER] User already exists:', email);
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
    console.log('[REGISTER] Hashing password');
    const hashedPassword = await bcrypt.hash(password, 12);
    console.log('[REGISTER] Password hashed successfully');

    // Create user
    const userId = crypto.randomUUID();
    console.log('[REGISTER] Creating user with ID:', userId);
    
    const insertResult = await sql`
      INSERT INTO users (id, email, name, role, verified, created_at, updated_at, password_hash)
      VALUES (${userId}, ${email}, ${name}, 'student', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, ${hashedPassword})
    `;
    
    console.log('[REGISTER] User inserted, rows affected:', insertResult?.length);

    // Get the created user
    console.log('[REGISTER] Fetching created user');
    const users = await sql`SELECT id, email, name, role, verified, created_at FROM users WHERE id = ${userId}`;
    
    if (!users || users.length === 0) {
      console.error('[REGISTER] Failed to verify user was created');
      const response = NextResponse.json(
        { error: 'Failed to create user - verification failed' },
        { status: 500 }
      );
      response.headers.set('Access-Control-Allow-Origin', '*');
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      return response;
    }

    const newUser = users[0];
    console.log('[REGISTER] User created successfully:', newUser.email);

    const response = NextResponse.json(
      { message: 'User created successfully', user: newUser },
      { status: 201 }
    );
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return response;
  } catch (error) {
    console.error('[REGISTER] Registration error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[REGISTER] Error details:', errorMessage);
    const response = NextResponse.json(
      { error: 'Failed to create user', details: errorMessage },
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
