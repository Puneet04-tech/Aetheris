import { getDb, posts } from './backend/src/lib/database';
import { eq } from 'drizzle-orm';

async function checkPostQuestions() {
  try {
    const db = getDb();
    const questionPosts = await db.select().from(posts).where(eq(posts.type, 'QUESTION'));
    console.log('Total Question Posts in DB:', questionPosts.length);
    console.log('Question Posts:', JSON.stringify(questionPosts, null, 2));
  } catch (error) {
    console.error('Error checking question posts:', error);
  }
}

checkPostQuestions();
