import { NextRequest, NextResponse } from 'next/server';
import { getDb, comments, questions, users } from '../../../../../lib/database';
import { eq } from 'drizzle-orm';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../../lib/auth';

// Add CORS headers to response
function addCorsHeaders(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', 'http://localhost:3002');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: questionId } = await params;
    const database = getDb();

    const queryResults = await database
      .select({
        id: comments.id,
        content: comments.content,
        authorId: comments.authorId,
        upvotes: comments.upvotes,
        downvotes: comments.downvotes,
        isApprovedAnswer: comments.isApprovedAnswer,
        createdAt: comments.createdAt,
        updatedAt: comments.updatedAt,
        author: {
          name: users.name,
          image: users.image,
        }
      })
      .from(comments)
      .where(eq(comments.postId, questionId))
      .leftJoin(users, eq(comments.authorId, users.id))
      .orderBy(comments.createdAt);

    return addCorsHeaders(NextResponse.json({
      answers: queryResults,
    }));
  } catch (error) {
    console.error('Error fetching answers:', error);
    return addCorsHeaders(NextResponse.json(
      { error: 'Failed to fetch answers', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    ));
  }
}

export async function OPTIONS(request: NextRequest) {
  return addCorsHeaders(new NextResponse(null, { status: 200 }));
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const { content } = body;
    const { id: questionId } = await params;

    if (!content || content.trim().length === 0) {
      return addCorsHeaders(NextResponse.json(
        { error: 'Answer content is required' },
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

    // Verify question exists
    const question = await database
      .select()
      .from(questions)
      .where(eq(questions.id, questionId))
      .limit(1);

    if (!question || question.length === 0) {
      return addCorsHeaders(NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      ));
    }

    const commentId = `answer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Insert answer as a comment
    const newComment = await database
      .insert(comments)
      .values({
        id: commentId,
        content: content.trim(),
        postId: questionId, // Using postId field to link to question
        authorId: user[0].id,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    // Update question status
    const newAnswerCount = (question[0].answerCount || 0) + 1;
    await database
      .update(questions)
      .set({
        answerCount: newAnswerCount,
        isAnswered: true,
        updatedAt: new Date(),
      })
      .where(eq(questions.id, questionId));

    return addCorsHeaders(NextResponse.json(
      {
        success: true,
        answer: {
          ...newComment[0],
          author: {
            name: user[0].name,
            image: user[0].image,
          },
        },
        message: 'Answer posted successfully',
      },
      { status: 201 }
    ));
  } catch (error) {
    console.error('Error posting answer:', error);
    return addCorsHeaders(NextResponse.json(
      { error: 'Failed to post answer', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    ));
  }
}
