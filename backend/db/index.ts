import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';

let sql: any;
let db: any;

try {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set');
  }
  sql = neon(process.env.DATABASE_URL!);
  db = drizzle(sql, { schema });
} catch (error) {
  console.warn('Database initialization failed:', error instanceof Error ? error.message : 'Unknown error');
  console.warn('Running in degraded mode - some features will be unavailable');
  // Create a mock db for now
  db = null;
}

export { db };
export * from './schema';
