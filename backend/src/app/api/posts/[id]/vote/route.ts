import { NextRequest, NextResponse } from 'next/server';
import { db, votes, posts } from '../../../../../lib/database';
import { eq, and, sql } from 'drizzle-orm';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../../lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { voteType } = await request.json();
    const { id: postId } = await params;

    // Check if user already voted
    const database = db();
    const [existingVote] = await database
      .select()
      .from(votes)
      .where(and(eq(votes.postId, postId), eq(votes.userId, (session.user as any).id!)));

    if (existingVote) {
      // Update existing vote
      if (existingVote.type === voteType) {
        // Remove vote if same type
        await database.delete(votes).where(and(eq(votes.postId, postId), eq(votes.userId, (session.user as any).id!)));
        
        // Update post vote counts
        if (voteType === 'upvote') {
          await database.update(posts)
            .set({ upvotes: sql`${posts.upvotes} - 1` })
            .where(eq(posts.id, postId));
        } else {
          await database.update(posts)
            .set({ downvotes: sql`${posts.downvotes} - 1` })
            .where(eq(posts.id, postId));
        }
        
        return NextResponse.json({ voted: false });
      } else {
        // Change vote type
        await database.update(votes)
          .set({ type: voteType })
          .where(and(eq(votes.postId, postId), eq(votes.userId, (session.user as any).id!)));
        
        // Update post vote counts
        await database.update(posts)
          .set({ 
            upvotes: sql`${posts.upvotes} + ${voteType === 'upvote' ? 1 : -1}`,
            downvotes: sql`${posts.downvotes} + ${voteType === 'downvote' ? 1 : -1}`
          })
          .where(eq(posts.id, postId));
        
        return NextResponse.json({ voted: true, type: voteType });
      }
    } else {
      // Add new vote
      await database.insert(votes).values({
        postId,
        userId: (session.user as any).id!,
        type: voteType,
      });
      
      // Update post vote counts
      if (voteType === 'upvote') {
        await database.update(posts)
          .set({ upvotes: sql`${posts.upvotes} + 1` })
          .where(eq(posts.id, postId));
      } else {
        await database.update(posts)
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
