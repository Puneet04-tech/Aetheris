'use server';

import { db } from '@/lib/db';
import { communities, communityMembers, users } from '@/lib/db/schema';
import { eq, desc, sql, and } from 'drizzle-orm';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function getCommunities(options: {
  page?: number;
  limit?: number;
  search?: string;
  filter?: 'all' | 'joined' | 'trending';
}) {
  const { page = 1, limit = 20, search, filter } = options;
  const offset = (page - 1) * limit;

  // Build the base query
  let query = db
    .select({
      id: communities.id,
      name: communities.name,
      slug: communities.slug,
      description: communities.description,
      icon: communities.icon,
      isPrivate: communities.isPrivate,
      memberCount: communities.memberCount,
      createdAt: communities.createdAt,
    })
    .from(communities);

  // Apply filters
  const conditions = [];
  
  if (search) {
    conditions.push(
      sql`(communities.name ILIKE ${'%' + search + '%'} OR communities.description ILIKE ${'%' + search + '%'} OR communities.slug ILIKE ${'%' + search + '%'})`
      );
    }

  if (conditions.length > 0) {
    query = query.where(sql`${conditions.join(' AND ')}`);
  }

  // Apply sorting
  if (filter === 'trending') {
    query = query.orderBy(desc(communities.memberCount));
  } else {
    query = query.orderBy(desc(communities.memberCount), desc(communities.createdAt));
  }

  return await query.limit(limit).offset(offset);
}

export async function createCommunity(data: {
  name: string;
  description: string;
  icon?: string;
  isPrivate?: boolean;
}) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const { name, description, icon, isPrivate } = data;

  if (!name || !description) {
    throw new Error('Missing required fields: name, description');
  }

  // Generate slug from name
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  // Check if community already exists
  const existingCommunity = await db
    .select()
    .from(communities)
    .where(eq(communities.slug, slug))
    .limit(1);

  if (existingCommunity.length > 0) {
    throw new Error('Community with this name already exists');
  }

  const [newCommunity] = await db.insert(communities).values({
    id: `comm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name,
    slug,
    description,
    icon: icon || '🏢',
    isPrivate: isPrivate || false,
    memberCount: 1, // Creator is first member
    creatorId: session.user.id,
  }).returning();

  // Add creator as admin member
  await db.insert(communityMembers).values({
    id: `member_${session.user.id}_${newCommunity.id}`,
    userId: session.user.id,
    communityId: newCommunity.id,
    role: 'admin',
  });

  revalidatePath('/communities');
  
  return newCommunity;
}

export async function joinCommunity(communityId: string) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  // Check if user is already a member
  const existingMembership = await db
    .select()
    .from(communityMembers)
    .where(
      and(
        eq(communityMembers.userId, session.user.id),
        eq(communityMembers.communityId, communityId)
      )
    )
    .limit(1);

  if (existingMembership.length > 0) {
    throw new Error('Already a member of this community');
  }

  // Add user as member
  await db.insert(communityMembers).values({
    id: `member_${session.user.id}_${communityId}`,
    userId: session.user.id,
    communityId,
    role: 'member',
  });

  // Increment community member count
  await db
    .update(communities)
    .set({ 
      memberCount: sql`${communities.memberCount} + 1` 
    })
    .where(eq(communities.id, communityId));

  revalidatePath('/communities');
  
  return { success: true };
}

export async function leaveCommunity(communityId: string) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  // Remove user from community
  await db
    .delete(communityMembers)
    .where(
      and(
        eq(communityMembers.userId, session.user.id),
        eq(communityMembers.communityId, communityId)
      )
    );

  // Decrement community member count
  await db
    .update(communities)
    .set({ 
      memberCount: sql`${communities.memberCount} - 1` 
    })
    .where(eq(communities.id, communityId));

  revalidatePath('/communities');
  
  return { success: true };
}

export async function getUserCommunities(userId: string) {
  const userCommunities = await db
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
    .where(eq(communityMembers.userId, userId))
    .orderBy(desc(communities.memberCount));

  return userCommunities;
}

export async function isUserMember(communityId: string) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return false;
  }

  const membership = await db
    .select()
    .from(communityMembers)
    .where(
      and(
        eq(communityMembers.userId, session.user.id),
        eq(communityMembers.communityId, communityId)
      )
    )
    .limit(1);

  return membership.length > 0;
}
