import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3001';
  
  // Redirect to NextAuth Google provider
  const googleAuthUrl = `${baseUrl}/api/auth/signin/google`;
  
  return NextResponse.redirect(googleAuthUrl);
}
