import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3001';
  
  // Redirect to NextAuth GitHub provider
  const githubAuthUrl = `${baseUrl}/api/auth/signin/github`;
  
  return NextResponse.redirect(githubAuthUrl);
}
