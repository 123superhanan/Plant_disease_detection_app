import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
dotenv.config();

export const sql = neon(process.env.DATABASE_URL);

export async function initDB() {
  try {
    // USERS
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        clerk_id VARCHAR(255) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // USER CONTEXT (info gathering page)
    await sql`
      CREATE TABLE IF NOT EXISTS ai_context (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        age INTEGER,
        gender VARCHAR(50),
        goal VARCHAR(255),
        condition VARCHAR(255),
        extra_notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // USER IMAGES (inference records)
    await sql`
      CREATE TABLE IF NOT EXISTS images (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        context_id INTEGER REFERENCES ai_context(id) ON DELETE SET NULL,
        image_url TEXT NOT NULL,
        predicted_label VARCHAR(255),
        confidence DECIMAL(6,5),
        prediction JSONB,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // NOTIFICATIONS
    await sql`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        type VARCHAR(50),               -- system, result, alert
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        icon VARCHAR(100),
        color VARCHAR(20),
        is_read BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // TRAINING DATA METADATA (offline dataset tracking)
    await sql`
      CREATE TABLE IF NOT EXISTS training_samples (
        id SERIAL PRIMARY KEY,
        source VARCHAR(255),            -- kaggle, plantvillage
        image_url TEXT NOT NULL,
        label VARCHAR(255) NOT NULL,
        metadata JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    console.log('AI Database initialized');
  } catch (error) {
    console.error('DB init error:', error);
    process.exit(1);
  }
}
