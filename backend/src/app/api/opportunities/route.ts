import { NextRequest, NextResponse } from 'next/server';
import { db, opportunities, users } from '../../../lib/database';
import { eq, desc, sql, and } from 'drizzle-orm';
import { addCorsHeaders, corsOptions } from '../../../lib/cors-utils';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');
    const type = searchParams.get('type');
    const remote = searchParams.get('remote');

    const database = db();
    
    // Build filter conditions
    const filters = [eq(opportunities.isActive, true)];
    if (type) {
      filters.push(eq(opportunities.type, type));
    }
    if (remote !== null) {
      filters.push(eq(opportunities.remote, remote === 'true'));
    }

    const results = await database
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
      .where(and(...filters))
      .leftJoin(users, eq(opportunities.authorId, users.id))
      .orderBy(desc(opportunities.createdAt))
      .limit(limit)
      .offset(offset);

    return addCorsHeaders(NextResponse.json(results));
  } catch (error) {
    console.error('Error fetching opportunities:', error);
    return addCorsHeaders(NextResponse.json(
      { error: 'Failed to fetch opportunities' },
      { status: 500 }
    ));
  }
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
    const { title, description, company, location, type, salaryMin, salaryMax, equity, remote, tags } = body;

    const database = db();
    const [opportunity] = await database.insert(opportunities).values({
      id: crypto.randomUUID(),
      title,
      description,
      company,
      location,
      type,
      salaryMin: salaryMin || null,
      salaryMax: salaryMax || null,
      equity: equity || null,
      remote: remote || false,
      // Skip tags for now to fix basic functionality
      authorId: userId,
      isActive: true,
    }).returning();

    return addCorsHeaders(NextResponse.json(opportunity, { status: 201 }));
  } catch (error) {
    console.error('Error creating opportunity:', error);
    return addCorsHeaders(NextResponse.json(
      { error: 'Failed to create opportunity' },
      { status: 500 }
    ));
  }
}

export async function OPTIONS() {
  return corsOptions();
}
