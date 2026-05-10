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

    // Users table
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

    // ✅ FIXED: Add new columns to detection_history (separate query)
    await sql`
      ALTER TABLE detection_history 
      ADD COLUMN IF NOT EXISTS damage_severity VARCHAR(50),
      ADD COLUMN IF NOT EXISTS damage_percentage DECIMAL(5,2),
      ADD COLUMN IF NOT EXISTS validation_quality TEXT,
      ADD COLUMN IF NOT EXISTS validation_leaf TEXT;
    `;

    // Indexes for performance
    await sql`CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_detection_history_user_id ON detection_history(user_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_model_feedback_user_id ON model_feedback(user_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_user_recommendations_user_id ON user_recommendations(user_id);`;

    // 🔥 Keep database connection alive (prevents Neon cold starts)
    setInterval(async () => {
      try {
        await sql`SELECT 1`;
        console.log('💓 Database ping - connection kept alive');
      } catch (err) {
        // Silent fail
      }
    }, 30000); // Every 30 seconds

    console.log('✅ Database tables ready yehu');
  } catch (error) {
    console.error('❌ Database initialization failed:');
    console.error(error);
    process.exit(1);
  }
}

export { sql };
