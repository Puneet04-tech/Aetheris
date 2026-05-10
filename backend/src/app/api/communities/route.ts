import { NextRequest, NextResponse } from 'next/server';
import { db, communities, users, communityMembers } from '../../../lib/database';
import { eq, desc, sql, and } from 'drizzle-orm';
import { addCorsHeaders, corsOptions } from '../../../lib/cors-utils';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');

    const database = db();
    
    // Build filter conditions
    const filters = [];
    if (search) {
      filters.push(
        sql`(${communities.name} ILIKE ${'%' + search + '%'} OR ${communities.description} ILIKE ${'%' + search + '%'})`
      );
    }

    const results = await database
      .select({
        id: communities.id,
        name: communities.name,
        slug: communities.slug,
        description: communities.description,
        icon: communities.icon,
        isPrivate: communities.isPrivate,
        memberCount: communities.memberCount,
        creatorId: communities.creatorId,
        createdAt: communities.createdAt,
        creator: {
          name: users.name,
          image: users.image,
        },
      })
      .from(communities)
      .where(filters.length > 0 ? and(...filters) : undefined)
      .leftJoin(users, eq(communities.creatorId, users.id))
      .orderBy(desc(communities.memberCount))
      .limit(limit)
      .offset(offset);

    return addCorsHeaders(NextResponse.json(results));
  } catch (error) {
    console.error('Error fetching communities:', error);
    return addCorsHeaders(NextResponse.json(
      { error: 'Failed to fetch communities' },
      { status: 500 }
    ));
  }
}

export async function OPTIONS() {
  return corsOptions();
}

export async function POST(request: NextRequest) {
  try {
    // Custom auth check using Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = authHeader.split(' ')[1];
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, icon, isPrivate } = body;

    // Generate slug from name
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const database = db();
    const [community] = await database.insert(communities).values({
      id: crypto.randomUUID(),
      name,
      slug,
      description,
      icon,
      isPrivate,
      creatorId: userId,
      memberCount: 1,
    }).returning();

    // Add creator as member
    await database.insert(communityMembers).values({
      id: crypto.randomUUID(),
      userId: userId,
      communityId: community.id,
      role: 'admin',
    });

    return addCorsHeaders(NextResponse.json(community, { status: 201 }));
  } catch (error) {
    console.error('Error creating community:', error);
    return addCorsHeaders(NextResponse.json(
      { error: 'Failed to create community' },
      { status: 500 }
    ));
  }
}
