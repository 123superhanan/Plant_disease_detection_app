import { sql } from '../../config/db.js';

export async function getOrCreateUser(clerkId) {
  if (!clerkId) throw new Error('clerkId is required');

  try {
    console.log('🔄 getOrCreateUser started for clerkId:', clerkId);

    // Force updated_at so DO UPDATE always triggers and Neon returns the row
    let result = await sql`
      INSERT INTO users (clerk_id, email, created_at, updated_at)
      VALUES (${clerkId}, NULL, NOW(), NOW())
      ON CONFLICT (clerk_id) 
      DO UPDATE SET updated_at = NOW()
      RETURNING id, clerk_id, email, created_at, updated_at
    `;

    // Handle Neon fullResults: true → result.rows
    const rows = result?.rows ?? result ?? [];

    if (rows.length > 0) {
      const user = rows[0];
      console.log('✅ User from upsert:', {
        id: user.id,
        clerk_id: user.clerk_id,
        created_at: user.created_at,
      });
      return user;
    }

    // Rare fallback
    console.log('⚠️ Upsert returned no rows → fallback SELECT');
    result = await sql`
      SELECT id, clerk_id, email, created_at, updated_at 
      FROM users 
      WHERE clerk_id = ${clerkId} 
      LIMIT 1
    `;

    const fallbackRows = result?.rows ?? result ?? [];

    if (fallbackRows.length > 0) {
      const user = fallbackRows[0];
      console.log('✅ User from fallback:', user);
      return user;
    }

    console.error('❌ Failed to get or create user for clerkId:', clerkId);
    throw new Error(`Failed to get or create user for clerkId: ${clerkId}`);
  } catch (err) {
    console.error('❌ getOrCreateUser error:', err.message);
    if (err.code) console.error('Error code:', err.code);
    console.error('Stack:', err.stack);
    throw err;
  }
}
export async function upsertUserProfile(userId, data) {
  const { location, plant_phases, special_plants } = data || {};

  if (!userId) {
    throw new Error('userId is required for profile');
  }

  try {
    console.log('📝 Upserting profile for userId:', userId, 'Data:', {
      location,
      plant_phases: plant_phases?.length,
      special_plants: special_plants?.length,
    });

    const result = await sql`
      INSERT INTO user_profiles 
      (user_id, location, plant_phases, special_plants, updated_at)
      VALUES 
      (${userId}, ${location}, ${plant_phases}, ${special_plants}, NOW())
      ON CONFLICT (user_id) 
      DO UPDATE SET
        location = EXCLUDED.location,
        plant_phases = EXCLUDED.plant_phases,
        special_plants = EXCLUDED.special_plants,
        updated_at = NOW()
      RETURNING *
    `;

    const rows = result?.rows ?? result ?? [];
    const profile = rows[0];

    if (profile) {
      console.log('✅ Profile saved successfully for user:', userId);
      return profile;
    }

    throw new Error('Profile upsert returned no data');
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
