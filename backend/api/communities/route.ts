import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { communities, users, communityMembers } from '@/lib/db/schema';
import { eq, desc, sql } from 'drizzle-orm';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search');
    const filter = searchParams.get('filter'); // 'all', 'joined', 'trending'

    const offset = (page - 1) * limit;

    // Build the base query
    let query = db
      .select({
        id: communities.id,
        name: communities.name,
        slug: communities.slug,
        description: communities.description,
        icon: communities.icon,
        isPrivate: communities.isPrivate,
        memberCount: communities.memberCount,
        createdAt: communities.createdAt,
        creator: {
          id: users.id,
          name: users.name,
          image: users.image,
        },
      })
      .from(communities)
      .leftJoin(users, eq(communities.creatorId, users.id));

    // Apply filters
    const conditions = [];
    
    if (search) {
      conditions.push(
        sql`(communities.name ILIKE ${'%' + search + '%'} OR communities.description ILIKE ${'%' + search + '%'} OR communities.slug ILIKE ${'%' + search + '%'})`
      );
    }

    if (filter === 'trending') {
      // For trending, we could sort by member count growth or recent activity
      query = query.orderBy(desc(communities.memberCount));
    } else {
      query = query.orderBy(desc(communities.memberCount), desc(communities.createdAt));
    }

    if (conditions.length > 0) {
      query = query.where(sql`${conditions.join(' AND ')}`);
    }

    const results = await query.limit(limit).offset(offset);

    // Get total count for pagination
    const countQuery = db
      .select({ count: sql<number>`count(*)` })
      .from(communities);

    if (conditions.length > 0) {
      countQuery.where(sql`${conditions.join(' AND ')}`);
    }

    const totalCountResult = await countQuery;
    const totalCount = totalCountResult[0]?.count || 0;

    return NextResponse.json({
      communities: results,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching communities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch communities' },
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
    const { name, description, icon, isPrivate } = body;

    if (!name || !description) {
      return NextResponse.json(
        { error: 'Missing required fields: name, description' },
        { status: 400 }
      );
    }

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Check if community already exists
    const existingCommunity = await db
      .select()
      .from(communities)
      .where(eq(communities.slug, slug))
      .limit(1);

    if (existingCommunity.length > 0) {
      return NextResponse.json(
        { error: 'Community with this name already exists' },
        { status: 409 }
      );
    }

    const [newCommunity] = await db.insert(communities).values({
      id: `comm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      slug,
      description,
      icon: icon || '🏢',
      isPrivate: isPrivate || false,
      memberCount: 1, // Creator is first member
      creatorId: session.user.id,
    }).returning();

    // Add creator as admin member
    await db.insert(communityMembers).values({
      id: `member_${session.user.id}_${newCommunity.id}`,
      userId: session.user.id,
      communityId: newCommunity.id,
      role: 'admin',
    });

    return NextResponse.json(newCommunity, { status: 201 });
  } catch (error) {
    console.error('Error creating community:', error);
    return NextResponse.json(
      { error: 'Failed to create community' },
      { status: 500 }
    );
  }
}
