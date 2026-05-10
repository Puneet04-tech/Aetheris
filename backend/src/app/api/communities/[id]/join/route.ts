import { NextRequest, NextResponse } from 'next/server';
import { getDb, communityMembers, communities, users } from '../../../../../lib/database';
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

    const { id: communityId } = await params;
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

    // Verify community exists
    const community = await database
      .select()
      .from(communities)
      .where(eq(communities.id, communityId))
      .limit(1);

    if (!community || community.length === 0) {
      return NextResponse.json(
        { error: 'Community not found' },
        { status: 404 }
      );
    }

    // Check if already a member
    const existingMembership = await database
      .select()
      .from(communityMembers)
      .where(
        and(
          eq(communityMembers.userId, user[0].id),
          eq(communityMembers.communityId, communityId)
        )
      )
      .limit(1);

    if (existingMembership && existingMembership.length > 0) {
      // Leave community
      await database
        .delete(communityMembers)
        .where(eq(communityMembers.id, existingMembership[0].id));

      // Update member count
      const memberCount = Math.max(0, (community[0].memberCount || 0) - 1);
      await database
        .update(communities)
        .set({
          memberCount,
          updatedAt: new Date(),
        })
        .where(eq(communities.id, communityId));

      return NextResponse.json(
        {
          success: true,
          joined: false,
          message: 'Left community successfully',
        },
        { status: 200 }
      );
    } else {
      // Join community
      const memberId = `member_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      await database
        .insert(communityMembers)
        .values({
          id: memberId,
          userId: user[0].id,
          communityId,
          role: 'member',
          joinedAt: new Date(),
        });

      // Update member count
      const memberCount = (community[0].memberCount || 0) + 1;
      await database
        .update(communities)
        .set({
          memberCount,
          updatedAt: new Date(),
        })
        .where(eq(communities.id, communityId));

      return NextResponse.json(
        {
          success: true,
          joined: true,
          message: 'Joined community successfully',
        },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error('Error toggling community membership:', error);
    return NextResponse.json(
      { error: 'Failed to toggle community membership', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
