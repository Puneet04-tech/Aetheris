import { NextRequest, NextResponse } from 'next/server';
import { db, posts, users, communities, votes } from '../../../lib/database';
import { eq, desc, sql, and } from 'drizzle-orm';
import { addCorsHeaders, corsOptions } from '../../../lib/cors-utils';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');
    const communityId = searchParams.get('communityId');
    const sort = searchParams.get('sort') || 'latest';

    const database = db();
    
    // Build filter conditions
    const filters = [];
    if (communityId) {
      filters.push(eq(posts.communityId, communityId));
    }

    // Add ordering logic
    let orderByClause;
    switch (sort) {
      case 'top':
        orderByClause = desc(sql`${posts.upvotes} - ${posts.downvotes}`);
        break;
      case 'hot':
        orderByClause = desc(sql`${posts.upvotes} - ${posts.downvotes} / EXTRACT(EPOCH FROM (NOW() - ${posts.createdAt}))`);
        break;
      default:
        orderByClause = desc(posts.createdAt);
    }

    // Get current user ID from Authorization header if present
    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
    const currentUserId = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    const results = await database
      .select({
        id: posts.id,
        type: posts.type,
        title: posts.title,
        content: posts.content,
        excerpt: posts.excerpt,
        imageUrl: posts.imageUrl,
        codeUrl: posts.codeUrl,
        codeLanguage: posts.codeLanguage,
        linkUrl: posts.linkUrl,
        authorId: posts.authorId,
        communityId: posts.communityId,
        upvotes: posts.upvotes,
        downvotes: posts.downvotes,
        viewCount: posts.viewCount,
        commentCount: posts.commentCount,
        isPinned: posts.isPinned,
        isFeatured: posts.isFeatured,
        tags: posts.tags,
        metadata: posts.metadata,
        createdAt: posts.createdAt,
        updatedAt: posts.updatedAt,
        author: {
          name: users.name,
          image: users.image,
        },
        community: {
          id: communities.id,
          name: communities.name,
          slug: communities.slug,
        },
        userVote: votes.voteType, // Include the user's vote status
      })
      .from(posts)
      .where(filters.length > 0 ? and(...filters) : undefined)
      .leftJoin(users, eq(posts.authorId, users.id))
      .leftJoin(communities, eq(posts.communityId, communities.id))
      .leftJoin(
        votes,
        currentUserId 
          ? and(eq(posts.id, votes.postId), eq(votes.userId, currentUserId))
          : sql`FALSE` // Join with a condition that is always false if no user is logged in
      )
      .orderBy(orderByClause)
      .limit(limit)
      .offset(offset);

    const response = NextResponse.json(results);
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
    return response;
  } catch (error) {
    console.error('Error fetching posts:', error);
    const errorResponse = NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
    errorResponse.headers.set('Access-Control-Allow-Origin', '*');
    errorResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    errorResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type');
    return errorResponse;
    errorResponse.headers.set('Access-Control-Allow-Origin', '*');
    errorResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    errorResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type');
    return errorResponse;
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    // Custom auth check using Authorization header (case-insensitive)
    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = authHeader.split(' ')[1];
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { type, title, content } = body;

    const database = db();
    const [post] = await database.insert(posts).values({
      id: crypto.randomUUID(),
      type,
      title,
      content,
      authorId: userId,
    }).returning();

    const response = NextResponse.json({ 
      success: true, 
      post 
    }, { status: 201 });
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return response;
  } catch (error) {
    console.error('Error creating post:', error);
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack available');
    const errorResponse = NextResponse.json(
      { error: 'Failed to create post', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
    errorResponse.headers.set('Access-Control-Allow-Origin', '*');
    errorResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    errorResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return errorResponse;
  }
}
