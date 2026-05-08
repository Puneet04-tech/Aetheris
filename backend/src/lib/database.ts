import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from '../../db/schema';
import { readFileSync } from 'fs';
import { join } from 'path';

let sql: any;
let db: any;

function initializeDatabase() {
  try {
    const dbUrl = process.env.DATABASE_URL;
    
    if (!dbUrl) {
      console.error('DATABASE_URL is not set in runtime');
      throw new Error('DATABASE_URL is required for runtime');
    }
    
    console.log('Attempting to connect to database...');
    sql = neon(dbUrl);
    db = drizzle(sql, { schema });
    console.log('Database connected successfully');
    return db;
  } catch (error) {
    console.error('Database initialization failed:', error instanceof Error ? error.message : 'Unknown error');
    console.error('Full error:', error);
    throw error;
  }
}

export function getDb() {
  if (!db) {
    return initializeDatabase();
  }
  return db;
}

export { getDb as db };
export * from '../../db/schema';
