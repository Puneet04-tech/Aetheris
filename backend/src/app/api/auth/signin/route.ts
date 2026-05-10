import { NextRequest, NextResponse } from 'next/server';
import { getDb, users } from '../../../../lib/database';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { addCorsHeaders, corsOptions } from '../../../../lib/cors-utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return addCorsHeaders(NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      ));
    }

    const database = getDb();
    
    // Get user from database
    const userList = await database
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!userList || userList.length === 0) {
      return addCorsHeaders(NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      ));
    }

    const user = userList[0];

    // For now, return user info as a mock session token
    return addCorsHeaders(NextResponse.json(
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
    ));
  } catch (error) {
    console.error('Error during signin:', error);
    return addCorsHeaders(NextResponse.json(
      { error: 'Failed to sign in', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    ));
  }
}

export async function OPTIONS() {
  return corsOptions();
}
