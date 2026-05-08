import { NextRequest, NextResponse } from 'next/server';
import { db, opportunities, users } from '../../../lib/database';
import { eq, desc, sql } from 'drizzle-orm';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');
    const type = searchParams.get('type');
    const remote = searchParams.get('remote');

    const database = db();
    let query = database
      .select({
        id: opportunities.id,
        title: opportunities.title,
        description: opportunities.description,
        company: opportunities.company,
        location: opportunities.location,
        type: opportunities.type,
        salaryMin: opportunities.salaryMin,
        salaryMax: opportunities.salaryMax,
        equity: opportunities.equity,
        remote: opportunities.remote,
        tags: opportunities.tags,
        authorId: opportunities.authorId,
        createdAt: opportunities.createdAt,
        author: {
          name: users.name,
          image: users.image,
        },
      })
      .from(opportunities)
      .leftJoin(users, eq(opportunities.authorId, users.id))
      .where(eq(opportunities.isActive, true));

    if (type) {
      query = query.where(eq(opportunities.type, type));
    }

    if (remote !== null) {
      query = query.where(eq(opportunities.remote, remote === 'true'));
    }

    const results = await query.orderBy(desc(opportunities.createdAt)).limit(limit).offset(offset);

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error fetching opportunities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch opportunities' },
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
    const { title, description, company, location, type, salaryMin, salaryMax, equity, remote, tags } = body;

    const database = db();
    const [opportunity] = await database.insert(opportunities).values({
      title,
      description,
      company,
      location,
      type,
      salaryMin,
      salaryMax,
      equity,
      remote,
      tags,
      authorId: (session.user as any).id!,
      isActive: true,
    }).returning();

    return NextResponse.json(opportunity, { status: 201 });
  } catch (error) {
    console.error('Error creating opportunity:', error);
    return NextResponse.json(
      { error: 'Failed to create opportunity' },
      { status: 500 }
    );
  }
}
