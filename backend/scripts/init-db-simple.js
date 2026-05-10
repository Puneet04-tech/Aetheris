const { Pool } = require('pg');

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('DATABASE_URL not set');
  process.exit(1);
}

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function initializeDatabase() {
  const client = await pool.connect();
  try {
    console.log('Dropping existing tables...');
    
    const dropSQL = `
      DROP TABLE IF EXISTS endorsements CASCADE;
      DROP TABLE IF EXISTS expert_answers CASCADE;
      DROP TABLE IF EXISTS notifications CASCADE;
      DROP TABLE IF EXISTS case_studies CASCADE;
      DROP TABLE IF EXISTS user_streams CASCADE;
      DROP TABLE IF EXISTS user_follows CASCADE;
      DROP TABLE IF EXISTS skills CASCADE;
      DROP TABLE IF EXISTS saved_posts CASCADE;
      DROP TABLE IF EXISTS applications CASCADE;
      DROP TABLE IF EXISTS opportunities CASCADE;
      DROP TABLE IF EXISTS questions CASCADE;
      DROP TABLE IF EXISTS comments CASCADE;
      DROP TABLE IF EXISTS votes CASCADE;
      DROP TABLE IF EXISTS community_members CASCADE;
      DROP TABLE IF EXISTS communities CASCADE;
      DROP TABLE IF EXISTS posts CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
    `;
    
    await client.query(dropSQL);
    console.log('✅ Old tables dropped');

    console.log('Creating tables...');

    const createTablesSQL = `
      CREATE TABLE users (
        id TEXT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255),
        bio TEXT,
        image VARCHAR(500),
        cover_image VARCHAR(500),
        title VARCHAR(255),
        location VARCHAR(255),
        website VARCHAR(500),
        verified BOOLEAN DEFAULT false,
        role VARCHAR(50) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        email_verified_at TIMESTAMP
      );

      CREATE TABLE posts (
        id TEXT PRIMARY KEY,
        type VARCHAR(50),
        title VARCHAR(500) NOT NULL,
        content TEXT NOT NULL,
        excerpt VARCHAR(500),
        image_url VARCHAR(500),
        code_url VARCHAR(500),
        code_language VARCHAR(50),
        link_url VARCHAR(500),
        "authorId" TEXT REFERENCES users(id),
        "communityId" TEXT,
        upvotes INTEGER DEFAULT 0,
        downvotes INTEGER DEFAULT 0,
        view_count INTEGER DEFAULT 0,
        comment_count INTEGER DEFAULT 0,
        is_pinned BOOLEAN DEFAULT false,
        is_featured BOOLEAN DEFAULT false,
        tags TEXT[] DEFAULT '{}',
        metadata JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE communities (
        id TEXT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        description TEXT,
        icon VARCHAR(500),
        is_private BOOLEAN DEFAULT false,
        member_count INTEGER DEFAULT 0,
        "creatorId" TEXT REFERENCES users(id),
        category VARCHAR(100),
        rules TEXT,
        theme VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE community_members (
        id TEXT PRIMARY KEY,
        "userId" TEXT REFERENCES users(id),
        "communityId" TEXT REFERENCES communities(id),
        role VARCHAR(50) DEFAULT 'member',
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE votes (
        id TEXT PRIMARY KEY,
        "userId" TEXT REFERENCES users(id),
        "postId" TEXT REFERENCES posts(id),
        vote_type VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE comments (
        id TEXT PRIMARY KEY,
        content TEXT NOT NULL,
        "authorId" TEXT REFERENCES users(id),
        "postId" TEXT REFERENCES posts(id),
        likes INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE opportunities (
        id TEXT PRIMARY KEY,
        title VARCHAR(500) NOT NULL,
        description TEXT NOT NULL,
        company VARCHAR(255),
        location VARCHAR(255),
        type VARCHAR(50),
        salary_min DECIMAL(12, 2),
        salary_max DECIMAL(12, 2),
        equity VARCHAR(50),
        remote BOOLEAN DEFAULT false,
        tags TEXT[] DEFAULT '{}',
        "authorId" TEXT REFERENCES users(id),
        application_count INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE applications (
        id TEXT PRIMARY KEY,
        "userId" TEXT REFERENCES users(id),
        "opportunityId" TEXT REFERENCES opportunities(id),
        message TEXT,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE questions (
        id TEXT PRIMARY KEY,
        title VARCHAR(500) NOT NULL,
        content TEXT NOT NULL,
        "authorId" TEXT REFERENCES users(id),
        category VARCHAR(100),
        tags TEXT[] DEFAULT '{}',
        view_count INTEGER DEFAULT 0,
        answer_count INTEGER DEFAULT 0,
        is_answered BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE saved_posts (
        id TEXT PRIMARY KEY,
        "userId" TEXT REFERENCES users(id),
        "postId" TEXT REFERENCES posts(id),
        saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE skills (
        id TEXT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        "userId" TEXT REFERENCES users(id),
        endorsements INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE endorsements (
        id TEXT PRIMARY KEY,
        "userId" TEXT REFERENCES users(id),
        "skillId" TEXT REFERENCES skills(id),
        "endorserId" TEXT REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE user_follows (
        id TEXT PRIMARY KEY,
        follower_id TEXT REFERENCES users(id),
        following_id TEXT REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE user_streams (
        id TEXT PRIMARY KEY,
        "userId" TEXT REFERENCES users(id),
        "streamUrl" VARCHAR(500),
        is_live BOOLEAN DEFAULT false,
        viewers INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE notifications (
        id TEXT PRIMARY KEY,
        "recipientId" TEXT REFERENCES users(id),
        type VARCHAR(50),
        data JSONB,
        read BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE case_studies (
        id TEXT PRIMARY KEY,
        title VARCHAR(500) NOT NULL,
        description TEXT,
        "authorId" TEXT REFERENCES users(id),
        metrics JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE expert_answers (
        id TEXT PRIMARY KEY,
        "questionId" TEXT REFERENCES questions(id),
        "expertId" TEXT REFERENCES users(id),
        answer TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await client.query(createTablesSQL);
    console.log('✅ All tables created successfully!');
  } catch (error) {
    console.error('❌ Error initializing database:', error.message);
    process.exit(1);
  } finally {
    await client.release();
    await pool.end();
  }
}

initializeDatabase();
