import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../../db';
import { votes, posts } from '../../../../../db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../../auth';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { voteType } = await request.json();
    const postId = params.id;

    // Check if user already voted
    const [existingVote] = await db
      .select()
      .from(votes)
      .where(and(eq(votes.postId, postId), eq(votes.userId, session.user.id!)));

    if (existingVote) {
      // Update existing vote
      if (existingVote.type === voteType) {
        // Remove vote if same type
        await db.delete(votes).where(and(eq(votes.postId, postId), eq(votes.userId, session.user.id!)));
        
        // Update post vote counts
        if (voteType === 'upvote') {
          await db.update(posts)
            .set({ upvotes: sql`${posts.upvotes} - 1` })
            .where(eq(posts.id, postId));
        } else {
          await db.update(posts)
            .set({ downvotes: sql`${posts.downvotes} - 1` })
            .where(eq(posts.id, postId));
        }
        
        return NextResponse.json({ voted: false });
      } else {
        // Change vote type
        await db.update(votes)
          .set({ type: voteType })
          .where(and(eq(votes.postId, postId), eq(votes.userId, session.user.id!)));
        
        // Update post vote counts
        await db.update(posts)
          .set({ 
            upvotes: sql`${posts.upvotes} + ${voteType === 'upvote' ? 1 : -1}`,
            downvotes: sql`${posts.downvotes} + ${voteType === 'downvote' ? 1 : -1}`
          })
          .where(eq(posts.id, postId));
        
        return NextResponse.json({ voted: true, type: voteType });
      }
    } else {
      // Add new vote
      await db.insert(votes).values({
        postId,
        userId: session.user.id!,
        type: voteType,
      });
      
      // Update post vote counts
      if (voteType === 'upvote') {
        await db.update(posts)
          .set({ upvotes: sql`${posts.upvotes} + 1` })
          .where(eq(posts.id, postId));
      } else {
        await db.update(posts)
          .set({ downvotes: sql`${posts.downvotes} + 1` })
          .where(eq(posts.id, postId));
      }
      
      return NextResponse.json({ voted: true, type: voteType });
    }
  } catch (error) {
    console.error('Error voting on post:', error);
    return NextResponse.json(
      { error: 'Failed to vote on post' },
      { status: 500 }
    );
  }
}
