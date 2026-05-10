import { NextRequest, NextResponse } from 'next/server';
import { getDb, questions, users } from '../../../lib/database';
import { eq, desc, and } from 'drizzle-orm';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');
    const sort = searchParams.get('sort') || 'latest'; // 'latest', 'trending', 'unanswered'

    const database = getDb();

    // Build filter conditions
    const filters = [];
    if (sort === 'unanswered') {
      filters.push(eq(questions.isAnswered, false));
    }

    // Add ordering logic
    let orderByClause;
    if (sort === 'trending') {
      orderByClause = desc(questions.viewCount);
    } else {
      orderByClause = desc(questions.createdAt);
    }

    const results = await database
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
      .where(filters.length > 0 ? and(...filters) : undefined)
      .leftJoin(users, eq(questions.authorId, users.id))
      .orderBy(orderByClause)
      .limit(limit)
      .offset(offset);

    return NextResponse.json({
      questions: results,
      pagination: { limit, offset, count: results.length },
    });
  } catch (error) {
    console.error('Error fetching questions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch questions', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, content, category = 'general', tags = [] } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Missing required fields: title, content' },
        { status: 400 }
      );
    }

    const database = getDb();

    // Get user
    const user = await database
      .select()
      .from(users)
      .where(eq(users.email, session.user.email))
      .limit(1);

    if (!user || user.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
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

    return NextResponse.json(
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
    );
  } catch (error) {
    console.error('Error creating question:', error);
    return NextResponse.json(
      { error: 'Failed to create question', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
