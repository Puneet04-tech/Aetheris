import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { posts, users, communities, votes } from '@/lib/db/schema';
import { eq, desc, sql } from 'drizzle-orm';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sortBy = searchParams.get('sort') || 'trending';
    const type = searchParams.get('type');
    const community = searchParams.get('community');
    const search = searchParams.get('search');

    const offset = (page - 1) * limit;

    // Build the base query
    let query = db
      .select({
        id: posts.id,
        type: posts.type,
        title: posts.title,
        content: posts.content,
        imageUrl: posts.imageUrl,
        codeUrl: posts.codeUrl,
        codeLanguage: posts.codeLanguage,
        linkUrl: posts.linkUrl,
        upvotes: posts.upvotes,
        downvotes: posts.downvotes,
        viewCount: posts.viewCount,
        isPinned: posts.isPinned,
        tags: posts.tags,
        createdAt: posts.createdAt,
        updatedAt: posts.updatedAt,
        author: {
          id: users.id,
          name: users.name,
          image: users.image,
          role: users.role,
        },
        community: {
          id: communities.id,
          name: communities.name,
          slug: communities.slug,
        },
      })
      .from(posts)
      .leftJoin(users, eq(posts.authorId, users.id))
      .leftJoin(communities, eq(posts.communityId, communities.id));

    // Apply filters
    const conditions = [];
    
    if (type && type !== 'all') {
      conditions.push(eq(posts.type, type as any));
    }
    
    if (community) {
      conditions.push(eq(communities.slug, community));
    }
    
    if (search) {
      conditions.push(
        sql`(posts.title ILIKE ${'%' + search + '%'} OR posts.content ILIKE ${'%' + search + '%'} OR ${posts.tags}::text ILIKE ${'%' + search + '%'})`
      );
    }

    if (conditions.length > 0) {
      query = query.where(sql`${conditions.join(' AND ')}`);
    }

    // Apply sorting
    switch (sortBy) {
      case 'trending':
        query = query.orderBy(
          desc(posts.isPinned),
          desc(sql`${posts.upvotes} - ${posts.downvotes}`),
          desc(posts.createdAt)
        );
        break;
      case 'latest':
        query = query.orderBy(
          desc(posts.isPinned),
          desc(posts.createdAt)
        );
        break;
      case 'top':
        query = query.orderBy(
          desc(posts.isPinned),
          desc(posts.viewCount),
          desc(posts.createdAt)
        );
        break;
      default:
        query = query.orderBy(
          desc(posts.isPinned),
          desc(sql`${posts.upvotes} - ${posts.downvotes}`),
          desc(posts.createdAt)
        );
    }

    const results = await query.limit(limit).offset(offset);

    // Get total count for pagination
    const countQuery = db
      .select({ count: sql<number>`count(*)` })
      .from(posts)
      .leftJoin(communities, eq(posts.communityId, communities.id));

    if (conditions.length > 0) {
      countQuery.where(sql`${conditions.join(' AND ')}`);
    }

    const totalCountResult = await countQuery;
    const totalCount = totalCountResult[0]?.count || 0;

    return NextResponse.json({
      posts: results,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { type, title, content, communityId, imageUrl, codeUrl, codeLanguage, linkUrl, tags } = body;

    if (!type || !title || !content) {
      return NextResponse.json(
        { error: 'Missing required fields: type, title, content' },
        { status: 400 }
      );
    }

    const [newPost] = await db.insert(posts).values({
      id: `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      title,
      content,
      authorId: session.user.id,
      communityId: communityId || null,
      imageUrl: imageUrl || null,
      codeUrl: codeUrl || null,
      codeLanguage: codeLanguage || null,
      linkUrl: linkUrl || null,
      tags: tags || [],
      upvotes: 0,
      downvotes: 0,
      viewCount: 0,
      isPinned: false,
    }).returning();

    return NextResponse.json(newPost, { status: 201 });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    );
  }
}
