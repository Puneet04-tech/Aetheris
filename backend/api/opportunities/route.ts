import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { opportunities, users } from '@/lib/db/schema';
import { eq, desc, sql, and } from 'drizzle-orm';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const type = searchParams.get('type');
    const remote = searchParams.get('remote');
    const search = searchParams.get('search');
    const salaryMin = parseInt(searchParams.get('salaryMin') || '0');
    const salaryMax = parseInt(searchParams.get('salaryMax') || '999999');

    const offset = (page - 1) * limit;

    // Build the base query
    let query = db
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
        isActive: opportunities.isActive,
        createdAt: opportunities.createdAt,
        updatedAt: opportunities.updatedAt,
        author: {
          id: users.id,
          name: users.name,
          image: users.image,
        },
      })
      .from(opportunities)
      .leftJoin(users, eq(opportunities.authorId, users.id));

    // Apply filters
    const conditions = [
      eq(opportunities.isActive, true),
      sql`${opportunities.salaryMin} >= ${salaryMin}`,
      sql`${opportunities.salaryMax} <= ${salaryMax}`,
    ];
    
    if (type && type !== 'all') {
      conditions.push(eq(opportunities.type, type as any));
    }
    
    if (remote === 'true') {
      conditions.push(eq(opportunities.remote, true));
    }
    
    if (search) {
      conditions.push(
        sql`(opportunities.title ILIKE ${'%' + search + '%'} OR opportunities.description ILIKE ${'%' + search + '%'} OR opportunities.company ILIKE ${'%' + search + '%'} OR ${opportunities.tags}::text ILIKE ${'%' + search + '%'})`
      );
    }

    query = query.where(and(...conditions));
    query = query.orderBy(desc(opportunities.createdAt));

    const results = await query.limit(limit).offset(offset);

    // Get total count for pagination
    const countQuery = db
      .select({ count: sql<number>`count(*)` })
      .from(opportunities)
      .where(and(...conditions));

    const totalCountResult = await countQuery;
    const totalCount = totalCountResult[0]?.count || 0;

    return NextResponse.json({
      opportunities: results,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
      },
    });
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
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { 
      title, 
      description, 
      company, 
      location, 
      type, 
      salaryMin, 
      salaryMax, 
      equity, 
      remote, 
      tags 
    } = body;

    if (!title || !description || !company || !type) {
      return NextResponse.json(
        { error: 'Missing required fields: title, description, company, type' },
        { status: 400 }
      );
    }

    const [newOpportunity] = await db.insert(opportunities).values({
      id: `opp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title,
      description,
      company,
      location: location || 'Remote',
      type,
      salaryMin: salaryMin || null,
      salaryMax: salaryMax || null,
      equity: equity || null,
      remote: remote || false,
      tags: tags || [],
      authorId: session.user.id,
      isActive: true,
    }).returning();

    return NextResponse.json(newOpportunity, { status: 201 });
  } catch (error) {
    console.error('Error creating opportunity:', error);
    return NextResponse.json(
      { error: 'Failed to create opportunity' },
      { status: 500 }
    );
  }
}
