import { sql } from '../../config/db.js';

export async function getOrCreateUser(clerkId) {
  if (!clerkId) throw new Error('clerkId is required');

  try {
    // Check for existing user
    const existing = await sql`
      SELECT id, clerk_id, email, created_at, updated_at
      FROM users WHERE clerk_id = ${clerkId} LIMIT 1
    `;

    if (existing.length > 0) {
      console.log('Existing user found:', existing[0]);
      return existing[0];
    }

    // Create new user
    console.log('Creating new user for clerkId:', clerkId);
    const inserted = await sql`
      INSERT INTO users (clerk_id, email, created_at)
      VALUES (${clerkId}, NULL, NOW())
      RETURNING id, clerk_id, email, created_at, updated_at
    `;

    if (inserted.length > 0) {
      console.log('New user created:', inserted[0]);
      return inserted[0];
    }

    // If we get here, something went wrong with the insert
    console.error('Insert succeeded but no user was returned');

    // Try one more time to fetch the user
    const fallback = await sql`
      SELECT id, clerk_id, email, created_at, updated_at
      FROM users WHERE clerk_id = ${clerkId} LIMIT 1
    `;

    if (fallback.length > 0) {
      return fallback[0];
    }

    // If still no user, throw an error
    throw new Error(`Failed to create or retrieve user for clerkId: ${clerkId}`);
  } catch (err) {
    console.error('getOrCreateUser error:', err.message);
    console.error('Stack:', err.stack);
    throw err;
  }
}

export async function upsertUserProfile(userId, data) {
  const { location, plant_phases, special_plants } = data || {};

  try {
    const profile = await sql`
      INSERT INTO user_profiles (user_id, location, plant_phases, special_plants, updated_at)
      VALUES (${userId}, ${location}, ${plant_phases}, ${special_plants}, NOW())
      ON CONFLICT (user_id) DO UPDATE SET
        location = EXCLUDED.location,
        plant_phases = EXCLUDED.plant_phases,
        special_plants = EXCLUDED.special_plants,
        updated_at = NOW()
      RETURNING *
    `;

    return profile[0];
  } catch (err) {
    console.error('upsertUserProfile error:', err.message);
    throw err;
  }
}

export async function getUserIdByClerkId(clerkId) {
  if (!clerkId) return null;

  const result = await sql`
    SELECT id FROM users WHERE clerk_id = ${clerkId} LIMIT 1
  `;
  return result && result.length > 0 ? result[0].id : null;
}
