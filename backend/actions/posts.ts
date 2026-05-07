'use server';

import { db } from '@/lib/db';
import { posts, votes, comments } from '@/lib/db/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function getPosts(options: {
  page?: number;
  limit?: number;
  sortBy?: 'trending' | 'latest' | 'top';
  type?: string;
  community?: string;
  search?: string;
}) {
  const {
    page = 1,
    limit = 10,
    sortBy = 'trending',
    type,
    community,
    search
  } = options;

  const offset = (page - 1) * limit;

  // Build the base query
  let query = db
    .select({
      id: posts.id,
      type: posts.type,
      title: posts.title,
      content: posts.content,
      imageUrl: posts.imageUrl,
      codeUrl: posts.codeUrl,
      codeLanguage: posts.codeLanguage,
      linkUrl: posts.linkUrl,
      upvotes: posts.upvotes,
      downvotes: posts.downvotes,
      viewCount: posts.viewCount,
      isPinned: posts.isPinned,
      tags: posts.tags,
      createdAt: posts.createdAt,
      updatedAt: posts.updatedAt,
    })
    .from(posts);

  // Apply filters
  const conditions = [];
  
  if (type && type !== 'all') {
    conditions.push(eq(posts.type, type as any));
  }
  
  if (search) {
    conditions.push(
      sql`(posts.title ILIKE ${'%' + search + '%'} OR posts.content ILIKE ${'%' + search + '%'} OR ${posts.tags}::text ILIKE ${'%' + search + '%'})`
    );
  }

  if (conditions.length > 0) {
    query = query.where(sql`${conditions.join(' AND ')}`);
  }

  // Apply sorting
  switch (sortBy) {
    case 'trending':
      query = query.orderBy(
        desc(posts.isPinned),
        desc(sql`${posts.upvotes} - ${posts.downvotes}`),
        desc(posts.createdAt)
      );
      break;
    case 'latest':
      query = query.orderBy(
        desc(posts.isPinned),
        desc(posts.createdAt)
      );
      break;
    case 'top':
      query = query.orderBy(
        desc(posts.isPinned),
        desc(posts.viewCount),
        desc(posts.createdAt)
      );
      break;
    default:
      query = query.orderBy(
        desc(posts.isPinned),
        desc(sql`${posts.upvotes} - ${posts.downvotes}`),
        desc(posts.createdAt)
      );
  }

  return await query.limit(limit).offset(offset);
}

export async function createPost(data: {
  type: string;
  title: string;
  content: string;
  communityId?: string;
  imageUrl?: string;
  codeUrl?: string;
  codeLanguage?: string;
  linkUrl?: string;
  tags?: string[];
}) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const { type, title, content, communityId, imageUrl, codeUrl, codeLanguage, linkUrl, tags } = data;

  if (!type || !title || !content) {
    throw new Error('Missing required fields: type, title, content');
  }

  const [newPost] = await db.insert(posts).values({
    id: `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type,
    title,
    content,
    authorId: session.user.id,
    communityId: communityId || null,
    imageUrl: imageUrl || null,
    codeUrl: codeUrl || null,
    codeLanguage: codeLanguage || null,
    linkUrl: linkUrl || null,
    tags: tags || [],
    upvotes: 0,
    downvotes: 0,
    viewCount: 0,
    isPinned: false,
  }).returning();

  revalidatePath('/feed');
  revalidatePath('/');
  
  return newPost;
}

export async function votePost(postId: string, voteType: 'upvote' | 'downvote') {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  // Check if user has already voted on this post
  const existingVote = await db
    .select()
    .from(votes)
    .where(
      and(
        eq(votes.userId, session.user.id),
        eq(votes.postId, postId)
      )
    )
    .limit(1);

  if (existingVote.length > 0) {
    // Update existing vote
    await db
      .update(votes)
      .set({ type: voteType })
      .where(
        and(
          eq(votes.userId, session.user.id),
          eq(votes.postId, postId)
        )
      );
  } else {
    // Create new vote
    await db.insert(votes).values({
      id: `vote_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: voteType,
      userId: session.user.id,
      postId,
    });
  }

  // Update post vote counts
  await updatePostVotes(postId);

  revalidatePath('/feed');
  revalidatePath('/');
}

export async function removeVotePost(postId: string) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  // Remove user's vote
  await db
    .delete(votes)
    .where(
      and(
        eq(votes.userId, session.user.id),
        eq(votes.postId, postId)
      )
    );

  // Update post vote counts
  await updatePostVotes(postId);

  revalidatePath('/feed');
  revalidatePath('/');
}

export async function getUserVote(postId: string) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return null;
  }

  const userVote = await db
    .select()
    .from(votes)
    .where(
      and(
        eq(votes.userId, session.user.id),
        eq(votes.postId, postId)
      )
    )
    .limit(1);

  return userVote[0] || null;
}

async function updatePostVotes(postId: string) {
  // Get vote counts
  const voteCounts = await db
    .select({
      upvotes: sql<number>`SUM(CASE WHEN ${votes.type} = 'upvote' THEN 1 ELSE 0 END)`,
      downvotes: sql<number>`SUM(CASE WHEN ${votes.type} = 'downvote' THEN 1 ELSE 0 END)`,
    })
    .from(votes)
    .where(eq(votes.postId, postId));

  const { upvotes, downvotes } = voteCounts[0] || { upvotes: 0, downvotes: 0 };

  // Update post with new vote counts
  await db
    .update(posts)
    .set({ 
      upvotes: upvotes || 0,
      downvotes: downvotes || 0,
    })
    .where(eq(posts.id, postId));
}
