import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../db';
import { posts, users, communities, votes } from '../../../../db/schema';
import { eq, desc, sql } from 'drizzle-orm';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');
    const communityId = searchParams.get('communityId');
    const sort = searchParams.get('sort') || 'latest';

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
        authorId: posts.authorId,
        communityId: posts.communityId,
        upvotes: posts.upvotes,
        downvotes: posts.downvotes,
        viewCount: posts.viewCount,
        tags: posts.tags,
        isPinned: posts.isPinned,
        createdAt: posts.createdAt,
        updatedAt: posts.updatedAt,
        author: {
          name: users.name,
          image: users.image,
        },
        community: {
          name: communities.name,
          slug: communities.slug,
          icon: communities.icon,
        },
      })
      .from(posts)
      .leftJoin(users, eq(posts.authorId, users.id))
      .leftJoin(communities, eq(posts.communityId, communities.id));

    if (communityId) {
      query = query.where(eq(posts.communityId, communityId));
    }

    switch (sort) {
      case 'top':
        query = query.orderBy(desc(sql`${posts.upvotes} - ${posts.downvotes}`));
        break;
      case 'hot':
        query = query.orderBy(desc(sql`${posts.upvotes} - ${posts.downvotes} / EXTRACT(EPOCH FROM (NOW() - ${posts.createdAt}))`));
        break;
      default:
        query = query.orderBy(desc(posts.createdAt));
    }

    const results = await query.limit(limit).offset(offset);

    return NextResponse.json(results);
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
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { type, title, content, communityId, imageUrl, codeUrl, codeLanguage, linkUrl, tags } = body;

    const [post] = await db.insert(posts).values({
      type,
      title,
      content,
      authorId: session.user.id!,
      communityId,
      imageUrl,
      codeUrl,
      codeLanguage,
      linkUrl,
      tags,
    }).returning();

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    );
  }
}
