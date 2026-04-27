// import { neon } from '@neondatabase/serverless';
// import dotenv from 'dotenv';

// dotenv.config();

// export const sql = neon(process.env.DATABASE_URL, {
//   fullResults: true, // optional: returns full result objects
//   fetchOptions: {
//     // helps with Neon timeouts
//     next: { revalidate: 0 },
//   },
// });

// export async function initDB() {
//   try {
//     // Drop tables in reverse order to avoid dependency errors
//     // Run this ONLY ONCE when you want to reset everything
//     // Comment out these 4 lines after first successful run
//     await sql`DROP TABLE IF EXISTS notifications CASCADE;`;
//     await sql`DROP TABLE IF EXISTS detection_history CASCADE;`;
//     await sql`DROP TABLE IF EXISTS user_profiles CASCADE;`;
//     await sql`DROP TABLE IF EXISTS users CASCADE;`;

//     // Users table (synced with Clerk)
//     await sql`
//   CREATE TABLE IF NOT EXISTS users (
//     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
//     clerk_id TEXT UNIQUE NOT NULL,
//     email TEXT,
//     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP   -- ← Add this line
//   );
// `;

//     // User profile with context info
//     await sql`
//       CREATE TABLE IF NOT EXISTS user_profiles (
//         id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
//         user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
//         location TEXT,
//         plant_phases TEXT[],
//         special_plants TEXT[],
//         updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//       );
//     `;

//     // Detection history
//     await sql`
//   CREATE TABLE IF NOT EXISTS detection_history (
//     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
//     user_id UUID REFERENCES users(id) ON DELETE CASCADE,
//     image_url TEXT NOT NULL,
//     disease_detected TEXT,
//     confidence DECIMAL(5,4),
//     prediction JSONB,
//     health_score INTEGER DEFAULT 0,  // ← ADD THIS
//     severity_level VARCHAR(50),       // ← ADD THIS
//     report_generated BOOLEAN DEFAULT FALSE, // ← ADD THIS
//     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//   );
// `;

//     // Notifications
//     await sql`
//       CREATE TABLE IF NOT EXISTS notifications (
//         id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
//         user_id UUID REFERENCES users(id) ON DELETE CASCADE,
//         type TEXT,
//         title TEXT,
//         message TEXT,
//         icon TEXT,
//         color TEXT,
//         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//       );
//     `;
//     // Model feedback table (for improving the AI)
//     await sql`
//   CREATE TABLE IF NOT EXISTS model_feedback (
//     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
//     detection_id UUID,
//     user_id UUID REFERENCES users(id) ON DELETE CASCADE,
//     correct BOOLEAN DEFAULT FALSE,
//     actual_disease TEXT,
//     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//   );
// `;

//     // Add useful indexes
//     await sql`CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);`;
//     await sql`CREATE INDEX IF NOT EXISTS idx_detection_history_user_id ON detection_history(user_id);`;
//     await sql`CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);`;
//   } catch (error) {
//     console.error('Database initialization failed:');
//     console.error(error);
//     process.exit(1);
//   }
// }
import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

export const sql = neon(process.env.DATABASE_URL, {
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

    /// Users table (synced with Clerk)
    await sql`
  CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clerk_id TEXT UNIQUE NOT NULL,
    email TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP   -- ← Add this line
  );
`;

    // User profile with context info
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

    console.log(' Database tables created successfully yehu');
  } catch (error) {
    console.error(' Database initialization failed:');
    console.error(error);
    process.exit(1);
  }
}
