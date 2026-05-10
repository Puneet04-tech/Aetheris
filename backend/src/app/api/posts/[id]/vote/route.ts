import { NextRequest, NextResponse } from 'next/server';
import { getDb, votes, posts, users } from '../../../../../lib/database';
import { eq, and } from 'drizzle-orm';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get Authorization header
    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      const response = NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      response.headers.set('Access-Control-Allow-Origin', '*');
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      return response;
    }

    const userId = authHeader.split(' ')[1];
    
    if (!userId) {
      const response = NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      response.headers.set('Access-Control-Allow-Origin', '*');
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      return response;
    }

    const { type: voteType } = await request.json(); // 'upvote' or 'downvote'
    const { id: postId } = await params;

    if (!voteType || !['upvote', 'downvote'].includes(voteType)) {
      const response = NextResponse.json(
        { error: 'Invalid vote type. Must be "upvote" or "downvote"' },
        { status: 400 }
      );
      response.headers.set('Access-Control-Allow-Origin', '*');
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      return response;
    }

    const database = getDb();

    // Verify user exists
    const user = await database
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user || user.length === 0) {
      const response = NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
      response.headers.set('Access-Control-Allow-Origin', '*');
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      return response;
    }

    // Check if user already voted
    const existingVote = await database
      .select()
      .from(votes)
      .where(
        and(
          eq(votes.userId, userId),
          eq(votes.postId, postId)
        )
      )
      .limit(1);

    const post = await database
      .select()
      .from(posts)
      .where(eq(posts.id, postId))
      .limit(1);

    if (!post || post.length === 0) {
      const response = NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
      response.headers.set('Access-Control-Allow-Origin', '*');
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      return response;
    }

    let upvotes = post[0].upvotes || 0;
    let downvotes = post[0].downvotes || 0;

    if (existingVote && existingVote.length > 0) {
      // Remove vote if same type (toggle)
      if (existingVote[0].voteType === voteType) {
        if (voteType === 'upvote') {
          upvotes = Math.max(0, upvotes - 1);
        } else {
          downvotes = Math.max(0, downvotes - 1);
        }
        await database
          .delete(votes)
          .where(eq(votes.id, existingVote[0].id));
        
        // Update post
        await database
          .update(posts)
          .set({
            upvotes,
            downvotes,
            updatedAt: new Date(),
          })
          .where(eq(posts.id, postId));
        
        const response = NextResponse.json({ success: true, voted: false, message: 'Vote removed' });
        response.headers.set('Access-Control-Allow-Origin', '*');
        response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        return response;
      } else {
        // Change vote type
        const wasUpvote = existingVote[0].voteType === 'upvote';
        if (wasUpvote) {
          upvotes = Math.max(0, upvotes - 1);
          downvotes += 1;
        } else {
          downvotes = Math.max(0, downvotes - 1);
          upvotes += 1;
        }
        await database
          .update(votes)
          .set({ voteType })
          .where(eq(votes.id, existingVote[0].id));
        
        await database
          .update(posts)
          .set({
            upvotes,
            downvotes,
            updatedAt: new Date(),
          })
          .where(eq(posts.id, postId));
        
        const response = NextResponse.json({ success: true, voted: true, type: voteType, message: 'Vote changed' });
        response.headers.set('Access-Control-Allow-Origin', '*');
        response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        return response;
      }
    } else {
      // Add new vote
      if (voteType === 'upvote') {
        upvotes += 1;
      } else {
        downvotes += 1;
      }

      const voteId = `vote_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await database.insert(votes).values({
        id: voteId,
        postId,
        userId,
        voteType,
        createdAt: new Date(),
      });
      
      await database
        .update(posts)
        .set({
          upvotes,
          downvotes,
          updatedAt: new Date(),
        })
        .where(eq(posts.id, postId));
      
      const response = NextResponse.json({ success: true, voted: true, type: voteType, message: 'Vote added' });
      response.headers.set('Access-Control-Allow-Origin', '*');
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      return response;
    }
  } catch (error) {
    console.error('Error voting on post:', error);
    const errorResponse = NextResponse.json(
      { error: 'Failed to vote on post', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
    errorResponse.headers.set('Access-Control-Allow-Origin', '*');
    errorResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    errorResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return errorResponse;
  }
}

export async function OPTIONS() {
  const response = NextResponse.json({}, { status: 200 });
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
}
