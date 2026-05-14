import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL, {
  fullResults: true,
  fetchOptions: {
    next: { revalidate: 0 },
  },
});

export async function initDB() {
  try {
    // 🔥 COMMENT THESE OUT - Only run once to create tables!
    // If you need to reset, run these manually in Neon console
    // await sql`DROP TABLE IF EXISTS notifications CASCADE;`;
    // await sql`DROP TABLE IF EXISTS detection_history CASCADE;`;
    // await sql`DROP TABLE IF EXISTS user_profiles CASCADE;`;
    // await sql`DROP TABLE IF EXISTS users CASCADE;`;
    // await sql`DROP TABLE IF EXISTS model_feedback CASCADE;`;
    // await sql`DROP TABLE IF EXISTS user_recommendations CASCADE;`;
    // await sql`DROP TABLE IF EXISTS app_users CASCADE;`;
    // await sql`DROP TABLE IF EXISTS user_sessions CASCADE;`;

    // ====================== CUSTOM AUTH TABLES ======================

    // App Users table (replaces Clerk)
    await sql`
      CREATE TABLE IF NOT EXISTS app_users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        name TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP
      );
    `;

    // Sessions table (for JWT tokens)
    await sql`
      CREATE TABLE IF NOT EXISTS user_sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES app_users(id) ON DELETE CASCADE,
        token TEXT UNIQUE NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // ====================== EXISTING TABLES (Keep as is) ======================

    // Users table (legacy Clerk - can keep or remove later)
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        clerk_id TEXT UNIQUE NOT NULL,
        email TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // User profile
    await sql`
      CREATE TABLE IF NOT EXISTS user_profiles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
        location TEXT,
        plant_phases TEXT[],
        special_plants TEXT[],
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Detection History
    await sql`
      CREATE TABLE IF NOT EXISTS detection_history (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        image_url TEXT NOT NULL,
        disease_detected TEXT,
        confidence DECIMAL(5,4),
        prediction JSONB,
        health_score INTEGER DEFAULT 0,
        severity_level VARCHAR(50),
        report_generated BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Notifications
    await sql`
      CREATE TABLE IF NOT EXISTS notifications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        type TEXT,
        title TEXT,
        message TEXT,
        icon TEXT,
        color TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Model Feedback
    await sql`
      CREATE TABLE IF NOT EXISTS model_feedback (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        detection_id UUID,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        correct BOOLEAN DEFAULT FALSE,
        actual_disease TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // User Recommendations (Cached recommendations)
    await sql`
      CREATE TABLE IF NOT EXISTS user_recommendations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        crop TEXT NOT NULL,
        growth_stage TEXT NOT NULL,
        season TEXT NOT NULL,
        recommendation TEXT NOT NULL,
        short_recommendation TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, crop, growth_stage, season)
      );
    `;

    // Add new columns to detection_history
    await sql`
      ALTER TABLE detection_history 
      ADD COLUMN IF NOT EXISTS damage_severity VARCHAR(50),
      ADD COLUMN IF NOT EXISTS damage_percentage DECIMAL(5,2),
      ADD COLUMN IF NOT EXISTS validation_quality TEXT,
      ADD COLUMN IF NOT EXISTS validation_leaf TEXT;
    `;

    // ====================== MIGRATE FOREIGN KEYS (Optional) ======================
    // Add app_user_id to existing tables (for new auth system)
    await sql`
      ALTER TABLE detection_history 
      ADD COLUMN IF NOT EXISTS app_user_id UUID REFERENCES app_users(id);
    `;

    await sql`
      ALTER TABLE user_profiles 
      ADD COLUMN IF NOT EXISTS app_user_id UUID REFERENCES app_users(id);
    `;

    await sql`
      ALTER TABLE notifications 
      ADD COLUMN IF NOT EXISTS app_user_id UUID REFERENCES app_users(id);
    `;

    // ====================== INDEXES ======================
    await sql`CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_detection_history_user_id ON detection_history(user_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_model_feedback_user_id ON model_feedback(user_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_user_recommendations_user_id ON user_recommendations(user_id);`;

    // New indexes for custom auth
    await sql`CREATE INDEX IF NOT EXISTS idx_app_users_email ON app_users(email);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(token);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);`;

    // 🔥 Keep database connection alive (prevents Neon cold starts)
    setInterval(async () => {
      try {
        await sql`SELECT 1`;
        console.log('💓 Database ping - connection kept alive');
      } catch (err) {
        // Silent fail
      }
    }, 30000);

    console.log('✅ Database tables ready (including custom auth)');
  } catch (error) {
    console.error('❌ Database initialization failed:');
    console.error(error);
    process.exit(1);
  }
}

export { sql };
