import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export async function GET(request: NextRequest) {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    
    // Get all users with their details
    const allUsers = await sql`
      SELECT id, email, name, role, password_hash, created_at 
      FROM users 
      ORDER BY created_at DESC
      LIMIT 10
    `;

    return NextResponse.json(
      {
        success: true,
        users: allUsers,
        totalCount: allUsers.length,
        message: 'Users retrieved successfully'
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch users', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
