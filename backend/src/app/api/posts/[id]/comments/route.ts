import { NextRequest, NextResponse } from 'next/server';
import { getDb, comments, posts, users } from '../../../../../lib/database';
import { eq } from 'drizzle-orm';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../../lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { content } = body;
    const { id: postId } = await params;

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Comment content is required' },
        { status: 400 }
      );
    }

    const database = getDb();

    // Get user
    const user = await database
      .select()
      .from(users)
      .where(eq(users.email, session.user.email))
      .limit(1);

    if (!user || user.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Verify post exists
    const post = await database
      .select()
      .from(posts)
      .where(eq(posts.id, postId))
      .limit(1);

    if (!post || post.length === 0) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    const commentId = `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Insert comment
    const newComment = await database
      .insert(comments)
      .values({
        id: commentId,
        content: content.trim(),
        postId,
        authorId: user[0].id,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    // Update post comment count
    await database
      .update(posts)
      .set({
        commentCount: (post[0].commentCount || 0) + 1,
        updatedAt: new Date(),
      })
      .where(eq(posts.id, postId));

    return NextResponse.json(
      {
        success: true,
        comment: {
          ...newComment[0],
          author: {
            name: user[0].name,
            image: user[0].image,
          },
        },
        message: 'Comment added successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error adding comment:', error);
    return NextResponse.json(
      { error: 'Failed to add comment', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
