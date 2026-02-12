import { neon } from '@neondatabase/serverless';

export const sql = neon(
  'postgresql://neondb_owner:npg_Ft3C1yjAGhVq@ep-cold-river-ahl5890h-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
);

export async function initDB() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        title VARCHAR(255) NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        categories VARCHAR(255) NOT NULL,
        created_at DATE NOT NULL DEFAULT CURRENT_DATE
      )
    `;
    console.log('Database initialized');
  } catch (error) {
    console.error('DB init error:', error);
    process.exit(1);
  }
}
