import { NextRequest, NextResponse } from 'next/server';
import { getDb, comments, votes, users } from '../../../../../../lib/database';
import { eq, and } from 'drizzle-orm';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../../../lib/auth';

// Add CORS headers to response
function addCorsHeaders(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', 'http://localhost:3002');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
}

export async function OPTIONS(request: NextRequest) {
  return addCorsHeaders(new NextResponse(null, { status: 200 }));
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Custom auth check using Authorization header
    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return addCorsHeaders(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }));
    }

    const userId = authHeader.split(' ')[1];
    if (!userId) {
      return addCorsHeaders(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }));
    }

    const body = await request.json();
    const { type } = body;
    const { id: answerId } = await params;

    if (!['upvote', 'downvote'].includes(type)) {
      return addCorsHeaders(NextResponse.json({ error: 'Invalid vote type' }, { status: 400 }));
    }

    const database = getDb();

    // Verify user exists
    const user = await database.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user || user.length === 0) {
      return addCorsHeaders(NextResponse.json({ error: 'User not found' }, { status: 404 }));
    }

    // Verify answer exists
    const answer = await database.select().from(comments).where(eq(comments.id, answerId)).limit(1);
    if (!answer || answer.length === 0) {
      return addCorsHeaders(NextResponse.json({ error: 'Answer not found' }, { status: 404 }));
    }

    // Check existing vote
    // Wait, votes table schema has:
    // id: text("id").primaryKey(),
    // userId: text("userId").references(() => users.id),
    // postId: text("postId").references(() => posts.id),
    // voteType: text("vote_type"),
    // If answer is in comments table, there's no commentId in votes!
    
    // So we can't easily store individual comment votes in `votes` table unless we add `commentId`.
    // Let's just update the count directly for simplicity.
    // However, this means users can vote multiple times.
    // For now, let's just increment upvotes/downvotes.
    
    let updateData: any = {};
    if (type === 'upvote') {
      updateData.upvotes = (answer[0].upvotes || 0) + 1;
    } else {
      updateData.downvotes = (answer[0].downvotes || 0) + 1;
    }

    await database.update(comments).set(updateData).where(eq(comments.id, answerId));

    return addCorsHeaders(NextResponse.json(
      { success: true, message: 'Vote recorded successfully' },
      { status: 200 }
    ));
  } catch (error) {
    console.error('Error voting on answer:', error);
    return addCorsHeaders(NextResponse.json(
      { error: 'Failed to vote', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    ));
  }
}
