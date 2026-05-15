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
    // ====================== APP USERS ======================

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

    // ====================== USER SESSIONS ======================

    await sql`
      CREATE TABLE IF NOT EXISTS user_sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES app_users(id) ON DELETE CASCADE,
        token TEXT UNIQUE NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // ====================== USER PROFILES ======================

    await sql`
      CREATE TABLE IF NOT EXISTS user_profiles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID UNIQUE REFERENCES app_users(id) ON DELETE CASCADE,
        location TEXT,
        plant_phases TEXT[],
        special_plants TEXT[],
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // ====================== DETECTION HISTORY ======================

    await sql`
      CREATE TABLE IF NOT EXISTS detection_history (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES app_users(id) ON DELETE CASCADE,
        image_url TEXT NOT NULL,
        disease_detected TEXT,
        confidence DECIMAL(5,4),
        prediction JSONB,
        health_score INTEGER DEFAULT 0,
        severity_level VARCHAR(50),
        damage_severity VARCHAR(50),
        damage_percentage DECIMAL(5,2),
        validation_quality TEXT,
        validation_leaf TEXT,
        report_generated BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // ====================== NOTIFICATIONS ======================

    await sql`
      CREATE TABLE IF NOT EXISTS notifications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES app_users(id) ON DELETE CASCADE,
        type TEXT,
        title TEXT,
        message TEXT,
        icon TEXT,
        color TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // ====================== MODEL FEEDBACK ======================

    await sql`
      CREATE TABLE IF NOT EXISTS model_feedback (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        detection_id UUID,
        user_id UUID REFERENCES app_users(id) ON DELETE CASCADE,
        correct BOOLEAN DEFAULT FALSE,
        actual_disease TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // ====================== USER RECOMMENDATIONS ======================

    await sql`
      CREATE TABLE IF NOT EXISTS user_recommendations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES app_users(id) ON DELETE CASCADE,
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

    // ====================== INDEXES ======================

    await sql`
      CREATE INDEX IF NOT EXISTS idx_app_users_email
      ON app_users(email);
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_user_sessions_token
      ON user_sessions(token);
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id
      ON user_sessions(user_id);
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id
      ON user_profiles(user_id);
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_detection_history_user_id
      ON detection_history(user_id);
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_notifications_user_id
      ON notifications(user_id);
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_model_feedback_user_id
      ON model_feedback(user_id);
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_user_recommendations_user_id
      ON user_recommendations(user_id);
    `;

    // ====================== KEEP DB ALIVE ======================

    setInterval(async () => {
      try {
        await sql`SELECT 1`;
        console.log('💓 Database ping');
      } catch (err) {}
    }, 30000);

    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization failed');
    console.error(error);
    process.exit(1);
  }
}

export { sql };
