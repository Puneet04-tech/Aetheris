'use server';

import { db } from '../../../../db';
import { communities, communityMembers, users } from '../../../../db/schema';
import { eq, desc, sql, and } from 'drizzle-orm';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth';
import { revalidatePath } from 'next/cache';

export async function getCommunities(options: {
  limit?: number;
  offset?: number;
  search?: string;
}) {
  const { limit = 10, offset = 0, search } = options;

  let query = db
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
    })
    .from(communities);

  if (search) {
    query = query.where(
      sql`(${communities.name} ILIKE ${'%' + search + '%'} OR ${communities.description} ILIKE ${'%' + search + '%'})`
    );
  }

  return await query.orderBy(desc(communities.memberCount)).limit(limit).offset(offset);
}

export async function createCommunity(data: {
  name: string;
  description: string;
  icon: string;
  isPrivate?: boolean;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const [community] = await db.insert(communities).values({
    ...data,
    slug,
    creatorId: session.user.id!,
    memberCount: 1,
  }).returning();

  // Add creator as admin
  await db.insert(communityMembers).values({
    userId: session.user.id!,
    communityId: community.id,
    role: 'admin',
  });

  revalidatePath('/communities');
  return community;
}

export async function joinCommunity(communityId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  // Check if already a member
  const [existingMembership] = await db
    .select()
    .from(communityMembers)
    .where(and(eq(communityMembers.communityId, communityId), eq(communityMembers.userId, session.user.id!)));

  if (existingMembership) {
    throw new Error('Already a member of this community');
  }

  // Add as member
  await db.insert(communityMembers).values({
    userId: session.user.id!,
    communityId,
    role: 'member',
  });

  // Update member count
  await db.update(communities)
    .set({ memberCount: sql`${communities.memberCount} + 1` })
    .where(eq(communities.id, communityId));

  revalidatePath('/communities');
  revalidatePath(`/communities/${communityId}`);
}

export async function leaveCommunity(communityId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  // Remove membership
  await db.delete(communityMembers)
    .where(and(eq(communityMembers.communityId, communityId), eq(communityMembers.userId, session.user.id!)));

  // Update member count
  await db.update(communities)
    .set({ memberCount: sql`${communities.memberCount} - 1` })
    .where(eq(communities.id, communityId));

  revalidatePath('/communities');
  revalidatePath(`/communities/${communityId}`);
}

export async function getUserCommunities(userId: string) {
  return await db
    .select({
      id: communities.id,
      name: communities.name,
      slug: communities.slug,
      description: communities.description,
      icon: communities.icon,
      isPrivate: communities.isPrivate,
      memberCount: communities.memberCount,
      role: communityMembers.role,
    })
    .from(communityMembers)
    .innerJoin(communities, eq(communityMembers.communityId, communities.id))
    .where(eq(communityMembers.userId, userId));
}

export async function isUserMember(communityId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return false;
  }

  const [membership] = await db
    .select()
    .from(communityMembers)
    .where(and(eq(communityMembers.communityId, communityId), eq(communityMembers.userId, session.user.id!)));

  return !!membership;
}
