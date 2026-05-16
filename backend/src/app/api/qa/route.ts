import { NextRequest, NextResponse } from 'next/server';
import { getDb, questions, users, posts } from '../../../lib/database';
import { eq, desc, and, sql } from 'drizzle-orm';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth';

// Add CORS headers to response
function addCorsHeaders(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', 'http://localhost:3002');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
}

export async function OPTIONS(request: NextRequest) {
  return addCorsHeaders(new NextResponse(null, { status: 200 }));
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');
    const sort = searchParams.get('sort') || 'latest'; // 'latest', 'trending', 'unanswered'

    const database = getDb();

    // Build filter conditions for questions table
    const qFilters = [];
    if (sort === 'unanswered') {
      qFilters.push(eq(questions.isAnswered, false));
    }

    // Build filter conditions for posts table
    const pFilters = [eq(posts.type, 'QUESTION')];

    // Fetch from questions table
    const qResults = await database
      .select({
        id: questions.id,
        title: questions.title,
        content: questions.content,
        authorId: questions.authorId,
        category: questions.category,
        tags: questions.tags,
        viewCount: questions.viewCount,
        answerCount: questions.answerCount,
        isAnswered: questions.isAnswered,
        createdAt: questions.createdAt,
        updatedAt: questions.updatedAt,
        author: {
          name: users.name,
          image: users.image,
        },
      })
      .from(questions)
      .leftJoin(users, eq(questions.authorId, users.id))
      .where(qFilters.length > 0 ? and(...qFilters) : undefined);

    // Fetch from posts table (only type QUESTION)
    const pResults = await database
      .select({
        id: posts.id,
        title: posts.title,
        content: posts.content,
        authorId: posts.authorId,
        category: sql<string>`'general'`,
        tags: posts.tags,
        viewCount: posts.viewCount,
        answerCount: posts.commentCount,
        isAnswered: sql<boolean>`FALSE`, // Default for posts
        createdAt: posts.createdAt,
        updatedAt: posts.updatedAt,
        author: {
          name: users.name,
          image: users.image,
        },
      })
      .from(posts)
      .leftJoin(users, eq(posts.authorId, users.id))
      .where(and(...pFilters));

    // Combine results
    let results = [...qResults, ...pResults];

    // Map and normalize structure (already done in select for some fields)
    results = results.map(row => ({
      ...row,
      // Ensure all fields are present
      isAnswered: row.isAnswered || false,
      answerCount: row.answerCount || 0,
      viewCount: row.viewCount || 0,
    }));

    // Sort combined results
    if (sort === 'unanswered') {
      results = results.filter(r => !r.isAnswered);
    }
    
    if (sort === 'trending') {
      results.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
    } else {
      // Default latest
      results.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
    }

    // Paginate
    const paginatedResults = results.slice(offset, offset + limit);

    return addCorsHeaders(NextResponse.json({
      questions: paginatedResults,
      pagination: { 
        limit, 
        offset, 
        count: paginatedResults.length,
        total: results.length 
      },
    }));
  } catch (error) {
    console.error('Error fetching questions:', error);
    return addCorsHeaders(NextResponse.json(
      { error: 'Failed to fetch questions', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    ));
  }
}

export async function POST(request: NextRequest) {
  try {
    // Custom auth check using Authorization header
    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return addCorsHeaders(NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      ));
    }

    const userId = authHeader.split(' ')[1];
    if (!userId) {
      return addCorsHeaders(NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      ));
    }

    const body = await request.json();
    const { title, content, category = 'general', tags = [] } = body;

    if (!title || !content) {
      return addCorsHeaders(NextResponse.json(
        { error: 'Missing required fields: title, content' },
        { status: 400 }
      ));
    }

    const database = getDb();

    // Get user by ID instead of email
    const user = await database
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user || user.length === 0) {
      return addCorsHeaders(NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      ));
    }

    const questionId = `question_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Insert question
    const newQuestion = await database
      .insert(questions)
      .values({
        id: questionId,
        title,
        content,
        authorId: user[0].id,
        category,
        tags,
        isAnswered: false,
        answerCount: 0,
        viewCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return addCorsHeaders(NextResponse.json(
      {
        success: true,
        question: {
          ...newQuestion[0],
          author: {
            name: user[0].name,
            image: user[0].image,
          },
        },
        message: 'Question created successfully',
      },
      { status: 201 }
    ));
  } catch (error) {
    console.error('Error creating question:', error);
    return addCorsHeaders(NextResponse.json(
      { error: 'Failed to create question', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    ));
  }
}
