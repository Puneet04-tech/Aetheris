import { NextRequest, NextResponse } from 'next/server';
import { getDb, applications, opportunities, users } from '../../../../../lib/database';
import { eq, and } from 'drizzle-orm';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../../lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id: opportunityId } = await params;
    const body = await request.json();
    const { message } = body;

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

    // Verify opportunity exists
    const opportunity = await database
      .select()
      .from(opportunities)
      .where(eq(opportunities.id, opportunityId))
      .limit(1);

    if (!opportunity || opportunity.length === 0) {
      return NextResponse.json(
        { error: 'Opportunity not found' },
        { status: 404 }
      );
    }

    // Check if already applied
    const existingApplication = await database
      .select()
      .from(applications)
      .where(
        and(
          eq(applications.userId, user[0].id),
          eq(applications.opportunityId, opportunityId)
        )
      )
      .limit(1);

    if (existingApplication && existingApplication.length > 0) {
      // Withdraw application
      await database
        .delete(applications)
        .where(eq(applications.id, existingApplication[0].id));

      // Update application count
      const applicationCount = Math.max(0, (opportunity[0].applicationCount || 0) - 1);
      await database
        .update(opportunities)
        .set({
          applicationCount,
          updatedAt: new Date(),
        })
        .where(eq(opportunities.id, opportunityId));

      return NextResponse.json(
        {
          success: true,
          applied: false,
          message: 'Application withdrawn successfully',
        },
        { status: 200 }
      );
    } else {
      // Create application
      const applicationId = `app_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      await database
        .insert(applications)
        .values({
          id: applicationId,
          opportunityId,
          userId: user[0].id,
          message: message || undefined,
          status: 'applied',
          createdAt: new Date(),
          updatedAt: new Date(),
        });

      // Update application count
      const applicationCount = (opportunity[0].applicationCount || 0) + 1;
      await database
        .update(opportunities)
        .set({
          applicationCount,
          updatedAt: new Date(),
        })
        .where(eq(opportunities.id, opportunityId));

      return NextResponse.json(
        {
          success: true,
          applied: true,
          message: 'Application submitted successfully',
        },
        { status: 201 }
      );
    }
  } catch (error) {
    console.error('Error toggling application:', error);
    return NextResponse.json(
      { error: 'Failed to toggle application', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
