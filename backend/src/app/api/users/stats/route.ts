import { NextRequest, NextResponse } from 'next/server';
import { db, users, posts, communityMembers, userFollows } from '../../../../lib/database';
import { eq, count, sql } from 'drizzle-orm';

// Add CORS headers to response
function addCorsHeaders(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', 'http://localhost:3002');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
}

export async function OPTIONS() {
  return addCorsHeaders(new NextResponse(null, { status: 200 }));
}

export async function GET(request: NextRequest) {
  try {
    // Get Authorization header
    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return addCorsHeaders(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }));
    }

    const userId = authHeader.split(' ')[1];
    
    if (!userId) {
      return addCorsHeaders(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }));
    }

    const database = db();
    console.log(`[Stats Debug] Fetching stats for user: ${userId}`);

    try {
      // Fetch each count individually with its own error handling to pinpoint the failure
      let postsCount = 0;
      let communitiesCount = 0;
      let followersCount = 0;
      let followingCount = 0;

      try {
        const res = await database.select({ value: sql<number>`count(*)` }).from(posts).where(eq(posts.authorId, userId));
        postsCount = Number(res[0]?.value) || 0;
      } catch (e: any) {
        console.error('[Stats Debug] Posts query failed:', e.message);
      }

      try {
        const res = await database.select({ value: sql<number>`count(*)` }).from(communityMembers).where(eq(communityMembers.userId, userId));
        communitiesCount = Number(res[0]?.value) || 0;
      } catch (e: any) {
        console.error('[Stats Debug] Communities query failed:', e.message);
      }

      try {
        const res = await database.select({ value: sql<number>`count(*)` }).from(userFollows).where(eq(userFollows.followeeId, userId));
        followersCount = Number(res[0]?.value) || 0;
      } catch (e: any) {
        console.error('[Stats Debug] Followers query failed:', e.message);
      }

      try {
        const res = await database.select({ value: sql<number>`count(*)` }).from(userFollows).where(eq(userFollows.followerId, userId));
        followingCount = Number(res[0]?.value) || 0;
      } catch (e: any) {
        console.error('[Stats Debug] Following query failed:', e.message);
      }

      return addCorsHeaders(NextResponse.json({
        followers: followersCount,
        following: followingCount,
        posts: postsCount,
        communities: communitiesCount
      }));
    } catch (error) {
      console.error('[Stats Debug] Unexpected error:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return addCorsHeaders(NextResponse.json(
      { error: 'Failed to fetch user stats', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    ));
  }
}
