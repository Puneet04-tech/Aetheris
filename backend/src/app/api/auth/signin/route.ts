import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    console.log('[SIGNIN] Attempting to sign in with email:', email);

    if (!email || !password) {
      console.log('[SIGNIN] Missing email or password');
      const response = NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
      response.headers.set('Access-Control-Allow-Origin', '*');
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      return response;
    }

    const sql = neon(process.env.DATABASE_URL!);
    
    // Get user from database
    console.log('[SIGNIN] Querying database for user with email:', email);
    const users = await sql`
      SELECT id, email, name, role, password_hash 
      FROM users 
      WHERE email = ${email} 
      LIMIT 1
    `;

    console.log('[SIGNIN] Query result:', users.length > 0 ? 'User found' : 'No user found');

    if (!users || users.length === 0) {
      console.log('[SIGNIN] User not found in database:', email);
      const response = NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
      response.headers.set('Access-Control-Allow-Origin', '*');
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      return response;
    }

    const user = users[0];
    console.log('[SIGNIN] User found - ID:', user.id, 'Email:', user.email);
    console.log('[SIGNIN] Password hash exists:', !!user.password_hash);

    // Verify password
    if (!user.password_hash) {
      console.error('[SIGNIN] User found but has no password hash:', email);
      const response = NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
      response.headers.set('Access-Control-Allow-Origin', '*');
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      return response;
    }

    console.log('[SIGNIN] Comparing passwords...');
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    console.log('[SIGNIN] Password valid:', isPasswordValid);

    if (!isPasswordValid) {
      console.error('[SIGNIN] Password mismatch for user:', email);
      const response = NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
      response.headers.set('Access-Control-Allow-Origin', '*');
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      return response;
    }

    console.log('[SIGNIN] Password verified successfully for:', email);
    // Password is valid, return user info
    const successResponse = NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        message: 'Sign in successful',
      },
      { status: 200 }
    );
    successResponse.headers.set('Access-Control-Allow-Origin', '*');
    successResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    successResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return successResponse;
  } catch (error) {
    console.error('[SIGNIN] Error during signin:', error);
    const response = NextResponse.json(
      { error: 'Failed to sign in', details: error instanceof Error ? error.message : 'Unknown error' },
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
