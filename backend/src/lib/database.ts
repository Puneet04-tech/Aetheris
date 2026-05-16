import { drizzle } from 'drizzle-orm/neon-http';
import { neon, NeonQueryFunction } from '@neondatabase/serverless';
import * as schema from '../../db/schema';

let sql: NeonQueryFunction<false, false> | null = null;
let db: ReturnType<typeof drizzle> | null = null;
let initialized = false;

function initializeDatabase() {
  try {
    const dbUrl = process.env.DATABASE_URL;
    
    if (!dbUrl) {
      console.error('DATABASE_URL is not set in runtime');
      throw new Error('DATABASE_URL is required for runtime');
    }
    
    if (!sql) {
      console.log('Creating Neon database connection...');
      sql = neon(dbUrl, {
        fetchConnectionCache: 'manual',
      });
    }
    
    if (!db) {
      db = drizzle(sql, { schema });
      console.log('Database initialized with Drizzle ORM');
    }
    
    initialized = true;
    return db;
  } catch (error) {
    console.error('Database initialization error:', error);
    initialized = true; // Mark as initialized even on error to prevent retries
    return null;
  }
}
    console.error('Database initialization failed:', error instanceof Error ? error.message : 'Unknown error');
    // Allow app to run without database in development
    initialized = true;
    return null;
  }
}

export function getDb() {
  if (!initialized) {
    initializeDatabase();
  }
  if (!db) {
    throw new Error('Database not available - check DATABASE_URL environment variable');
  }
  return db;
}

export { getDb as db };
export * from '../../db/schema';
