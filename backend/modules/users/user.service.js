import { sql } from '../../config/db.js';

export async function getOrCreateUser(clerkId) {
  const existing = await sql`
    SELECT * FROM users WHERE clerk_id = ${clerkId} LIMIT 1
  `;

  if (existing.length > 0) {
    return existing[0];
  }

  const inserted = await sql`
    INSERT INTO users (clerk_id)
    VALUES (${clerkId})
    RETURNING *
  `;

  return inserted[0];
}
