import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { votes, posts } from '@/lib/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { type } = body; // 'upvote' or 'downvote'

    if (!type || !['upvote', 'downvote'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid vote type' },
        { status: 400 }
      );
    }

    const postId = params.id;

    // Check if user has already voted on this post
    const existingVote = await db
      .select()
      .from(votes)
      .where(
        and(
          eq(votes.userId, session.user.id),
          eq(votes.postId, postId)
        )
      )
      .limit(1);

    if (existingVote.length > 0) {
      // Update existing vote
      const [updatedVote] = await db
        .update(votes)
        .set({ type })
        .where(
          and(
            eq(votes.userId, session.user.id),
            eq(votes.postId, postId)
          )
        )
        .returning();

      // Update post vote counts
      await updatePostVotes(postId);

      return NextResponse.json(updatedVote);
    } else {
      // Create new vote
      const [newVote] = await db.insert(votes).values({
        id: `vote_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type,
        userId: session.user.id,
        postId,
      }).returning();

      // Update post vote counts
      await updatePostVotes(postId);

      return NextResponse.json(newVote, { status: 201 });
    }
  } catch (error) {
    console.error('Error voting on post:', error);
    return NextResponse.json(
      { error: 'Failed to vote on post' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const postId = params.id;

    // Remove user's vote
    await db
      .delete(votes)
      .where(
        and(
          eq(votes.userId, session.user.id),
          eq(votes.postId, postId)
        )
      );

    // Update post vote counts
    await updatePostVotes(postId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing vote:', error);
    return NextResponse.json(
      { error: 'Failed to remove vote' },
      { status: 500 }
    );
  }
}

async function updatePostVotes(postId: string) {
  // Get vote counts
  const voteCounts = await db
    .select({
      upvotes: sql<number>`SUM(CASE WHEN ${votes.type} = 'upvote' THEN 1 ELSE 0 END)`,
      downvotes: sql<number>`SUM(CASE WHEN ${votes.type} = 'downvote' THEN 1 ELSE 0 END)`,
    })
    .from(votes)
    .where(eq(votes.postId, postId));

  const { upvotes, downvotes } = voteCounts[0] || { upvotes: 0, downvotes: 0 };

  // Update post with new vote counts
  await db
    .update(posts)
    .set({ 
      upvotes: upvotes || 0,
      downvotes: downvotes || 0,
    })
    .where(eq(posts.id, postId));
}
