'use server';

import { db } from '../../../../db';
import { posts, votes, comments } from '../../../../db/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth';
import { revalidatePath } from 'next/cache';

export async function getPosts(options: {
  limit?: number;
  offset?: number;
  communityId?: string;
  sort?: 'latest' | 'top' | 'hot';
}) {
  const { limit = 10, offset = 0, communityId, sort = 'latest' } = options;

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
      authorId: posts.authorId,
      communityId: posts.communityId,
      upvotes: posts.upvotes,
      downvotes: posts.downvotes,
      viewCount: posts.viewCount,
      tags: posts.tags,
      isPinned: posts.isPinned,
      createdAt: posts.createdAt,
      updatedAt: posts.updatedAt,
    })
    .from(posts);

  if (communityId) {
    query = query.where(eq(posts.communityId, communityId));
  }

  switch (sort) {
    case 'top':
      query = query.orderBy(desc(sql`${posts.upvotes} - ${posts.downvotes}`));
      break;
    case 'hot':
      query = query.orderBy(desc(sql`${posts.upvotes} - ${posts.downvotes} / EXTRACT(EPOCH FROM (NOW() - ${posts.createdAt}))`));
      break;
    default:
      query = query.orderBy(desc(posts.createdAt));
  }

  return await query.limit(limit).offset(offset);
}

export async function createPost(data: {
  type: 'REPO' | 'GALLERY' | 'ARTICLE' | 'PULSE' | 'JOB' | 'QUESTION';
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
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  const [post] = await db.insert(posts).values({
    ...data,
    authorId: session.user.id!,
  }).returning();

  revalidatePath('/');
  revalidatePath('/feed');
  return post;
}

export async function votePost(postId: string, voteType: 'upvote' | 'downvote') {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  // Check if user already voted
  const [existingVote] = await db
    .select()
    .from(votes)
    .where(and(eq(votes.postId, postId), eq(votes.userId, session.user.id!)));

  if (existingVote) {
    if (existingVote.type === voteType) {
      // Remove vote
      await db.delete(votes).where(and(eq(votes.postId, postId), eq(votes.userId, session.user.id!)));
      
      if (voteType === 'upvote') {
        await db.update(posts).set({ upvotes: sql`${posts.upvotes} - 1` }).where(eq(posts.id, postId));
      } else {
        await db.update(posts).set({ downvotes: sql`${posts.downvotes} - 1` }).where(eq(posts.id, postId));
      }
    } else {
      // Change vote
      await db.update(votes).set({ type: voteType }).where(and(eq(votes.postId, postId), eq(votes.userId, session.user.id!)));
      
      await db.update(posts).set({ 
        upvotes: sql`${posts.upvotes} + ${voteType === 'upvote' ? 1 : -1}`,
        downvotes: sql`${posts.downvotes} + ${voteType === 'downvote' ? 1 : -1}`
      }).where(eq(posts.id, postId));
    }
  } else {
    // Add new vote
    await db.insert(votes).values({
      postId,
      userId: session.user.id!,
      type: voteType,
    });
    
    if (voteType === 'upvote') {
      await db.update(posts).set({ upvotes: sql`${posts.upvotes} + 1` }).where(eq(posts.id, postId));
    } else {
      await db.update(posts).set({ downvotes: sql`${posts.downvotes} + 1` }).where(eq(posts.id, postId));
    }
  }

  revalidatePath('/');
  revalidatePath('/feed');
}

export async function getUserVote(postId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return null;
  }

  const [vote] = await db
    .select()
    .from(votes)
    .where(and(eq(votes.postId, postId), eq(votes.userId, session.user.id!)));

  return vote?.type || null;
}
