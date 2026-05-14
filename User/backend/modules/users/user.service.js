import { sql } from '../../config/db.js';

// Get or create user by email (custom auth)
export async function getOrCreateUserByEmail(email, name = null) {
  if (!email) throw new Error('Email is required');

  try {
    console.log('🔄 getOrCreateUser started for email:', email);

    let result = await sql`
      INSERT INTO app_users (email, name, created_at, last_login)
      VALUES (${email}, ${name}, NOW(), NOW())
      ON CONFLICT (email) 
      DO UPDATE SET last_login = NOW()
      RETURNING id, email, name, created_at, last_login
    `;

    const rows = result?.rows ?? result ?? [];

    if (rows.length > 0) {
      const user = rows[0];
      console.log('✅ User from upsert:', {
        id: user.id,
        email: user.email,
        created_at: user.created_at,
      });
      return user;
    }

    console.error('❌ Failed to get or create user for email:', email);
    throw new Error(`Failed to get or create user for email: ${email}`);
  } catch (err) {
    console.error('❌ getOrCreateUser error:', err.message);
    throw err;
  }
}

// Get user by ID
export async function getUserById(userId) {
  if (!userId) return null;

  const result = await sql`
    SELECT id, email, name, created_at, last_login 
    FROM app_users 
    WHERE id = ${userId} 
    LIMIT 1
  `;
  const rows = result?.rows ?? result ?? [];
  return rows.length > 0 ? rows[0] : null;
}

// Upsert user profile (still uses same table structure)
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

// Get user ID by email (for API compatibility)
export async function getUserIdByEmail(email) {
  if (!email) return null;

  const result = await sql`
    SELECT id FROM app_users WHERE email = ${email} LIMIT 1
  `;
  const rows = result?.rows ?? result ?? [];
  return rows.length > 0 ? rows[0].id : null;
}
