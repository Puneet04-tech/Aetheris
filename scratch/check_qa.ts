import { getDb, questions } from './backend/src/lib/database';

async function checkQuestions() {
  try {
    const db = getDb();
    const allQuestions = await db.select().from(questions);
    console.log('Total Questions in DB:', allQuestions.length);
    console.log('Questions:', JSON.stringify(allQuestions, null, 2));
  } catch (error) {
    console.error('Error checking questions:', error);
  }
}

checkQuestions();
