import { NextRequest, NextResponse } from 'next/server';
import { getDb, posts, users } from '../../../../lib/database';
import { eq } from 'drizzle-orm';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import { addCorsHeaders, corsOptions } from '../../../../lib/cors-utils';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return addCorsHeaders(NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      ));
    }

    const body = await request.json();
    const { type, title, content, tags = [] } = body;

    if (!type || !title || !content) {
      return addCorsHeaders(NextResponse.json(
        { error: 'Missing required fields: type, title, content' },
        { status: 400 }
      ));
    }

    const database = getDb();
    
    // Get user ID from email
    const user = await database
      .select()
      .from(users)
      .where(eq(users.email, session.user.email))
      .limit(1);

    if (!user || user.length === 0) {
      return addCorsHeaders(NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      ));
    }

    const postId = `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Insert new post
    const newPost = await database
      .insert(posts)
      .values({
        id: postId,
        type,
        title,
        content,
        authorId: user[0].id,
        tags: tags,
        upvotes: 0,
        downvotes: 0,
        viewCount: 0,
        commentCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return addCorsHeaders(NextResponse.json(
      {
        success: true,
        post: newPost[0],
        message: 'Post created successfully',
      },
      { status: 201 }
    ));
  } catch (error) {
    console.error('Error creating post:', error);
    return addCorsHeaders(NextResponse.json(
      { error: 'Failed to create post', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    ));
  }
}

export async function OPTIONS() {
  return corsOptions();
}
