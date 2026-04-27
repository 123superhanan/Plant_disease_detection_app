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
    await sql`DROP TABLE IF EXISTS notifications CASCADE;`;
    await sql`DROP TABLE IF EXISTS detection_history CASCADE;`;
    await sql`DROP TABLE IF EXISTS user_profiles CASCADE;`;
    await sql`DROP TABLE IF EXISTS users CASCADE;`;
    await sql`DROP TABLE IF EXISTS model_feedback CASCADE;`;

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

    // Notifications & Feedback
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

    await sql`CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_detection_history_user_id ON detection_history(user_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_model_feedback_user_id ON model_feedback(user_id);`;

    console.log('✅ Database tables created successfully yehu');
  } catch (error) {
    console.error('❌ Database initialization failed:');
    console.error(error);
    process.exit(1);
  }
}

// Single export
export { sql };
