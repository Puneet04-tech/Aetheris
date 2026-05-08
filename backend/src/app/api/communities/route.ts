import { NextRequest, NextResponse } from 'next/server';
import { db, communities, users, communityMembers } from '../../../lib/database';
import { eq, desc, sql } from 'drizzle-orm';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');

    const database = db();
    let query = database
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
      .leftJoin(users, eq(communities.creatorId, users.id));

    if (search) {
      query = query.where(
        sql`(${communities.name} ILIKE ${'%' + search + '%'} OR ${communities.description} ILIKE ${'%' + search + '%'})`
      );
    }

    const results = await query.orderBy(desc(communities.memberCount)).limit(limit).offset(offset);

    return NextResponse.json(results);
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
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, icon, isPrivate } = body;

    // Generate slug from name
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const database = db();
    const [community] = await database.insert(communities).values({
      name,
      slug,
      description,
      icon,
      isPrivate,
      creatorId: (session.user as any).id!,
      memberCount: 1,
    }).returning();

    // Add creator as member
    await database.insert(communityMembers).values({
      userId: (session.user as any).id!,
      communityId: community.id,
      role: 'admin',
    });

    return NextResponse.json(community, { status: 201 });
  } catch (error) {
    console.error('Error creating community:', error);
    return NextResponse.json(
      { error: 'Failed to create community' },
      { status: 500 }
    );
  }
}
