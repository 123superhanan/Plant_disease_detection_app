import { Router } from 'express';
import { sql } from '../../config/db.js';
import { requireAuth } from '../../middleware/clerk.middleware.js';
import { getOrCreateUser, upsertUserProfile } from './user.service.js';

const router = Router();

router.get('/me', async (req, res) => {
  console.log('ROUTE HIT');
  console.log('AUTH HEADER:', req.headers.authorization);
  console.log('REQ.AUTH:', req.auth);
  try {
    console.log('=== /api/users/me route called ===');
    console.log('req.auth:', JSON.stringify(req.auth, null, 2));

    const clerkId = req.auth?.userId || req.auth?.claims?.sub;

    if (!clerkId) {
      return res.status(401).json({ error: 'Unauthorized - No clerkId found' });
    }

    console.log('clerkId extracted:', clerkId);
    console.log('Auth header:', req.headers.authorization);
    // Use the improved getOrCreateUser
    const user = await getOrCreateUser(clerkId);

    console.log(' User returned successfully:', user);

    res.json({
      success: true,
      user: {
        id: user.id,
        clerk_id: user.clerk_id,
        email: user.email,
        created_at: user.created_at,
        updated_at: user.updated_at,
      },
    });
  } catch (err) {
    console.error('ERROR IN /api/users/me:');
    console.error('Message:', err.message);
    console.error('Stack:', err.stack);

    res.status(500).json({
      error: 'Internal server error',
      message: err.message,
      code: err.code || null,
    });
  }
});
// PUBLIC endpoint - no auth required (temporary)
router.post('/profile-public', async (req, res) => {
  console.log('🔥 PUBLIC PROFILE ENDPOINT HIT');
  console.log('Received body:', req.body);

  try {
    const { location, plant_phases, special_plants } = req.body;

    // Hardcoded user ID from your database
    const userId = '16f646e8-464f-426a-863c-5ef4404db5ea';

    console.log('Looking for user:', userId);

    // Check if user exists
    const userCheck = await sql`SELECT id FROM users WHERE id = ${userId}`;
    const userRows = userCheck?.rows ?? userCheck ?? [];

    if (userRows.length === 0) {
      console.log('User not found, creating...');
      await sql`
        INSERT INTO users (id, clerk_id, created_at, updated_at)
        VALUES (${userId}, 'user_39kFDg4Kshy2wB3B3bgIxmslhdS', NOW(), NOW())
      `;
    }

    // Upsert profile
    const result = await sql`
      INSERT INTO user_profiles (user_id, location, plant_phases, special_plants, updated_at)
      VALUES (${userId}, ${location}, ${plant_phases}, ${special_plants}, NOW())
      ON CONFLICT (user_id) 
      DO UPDATE SET 
        location = EXCLUDED.location,
        plant_phases = EXCLUDED.plant_phases,
        special_plants = EXCLUDED.special_plants,
        updated_at = NOW()
      RETURNING *
    `;

    const rows = result?.rows ?? result ?? [];
    console.log('✅ Profile saved:', rows[0]);

    res.json({ success: true, profile: rows[0] });
  } catch (error) {
    console.error('Error saving profile:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUBLIC endpoint to get profile
router.get('/profile-summary-public', async (req, res) => {
  console.log('🔥 PUBLIC PROFILE GET ENDPOINT HIT');

  try {
    const userId = '16f646e8-464f-426a-863c-5ef4404db5ea';

    const result = await sql`
      SELECT 
        u.id as user_id,
        u.clerk_id,
        up.location,
        up.plant_phases,
        up.special_plants,
        up.updated_at
      FROM users u
      LEFT JOIN user_profiles up ON u.id = up.user_id
      WHERE u.id = ${userId}
    `;

    const rows = result?.rows ?? result ?? [];
    console.log('Profile data:', rows[0]);

    res.json(
      rows[0] || {
        user_id: userId,
        location: null,
        plant_phases: [],
        special_plants: [],
      }
    );
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: error.message });
  }
});
router.post('/profile', requireAuth, async (req, res) => {
  try {
    const clerkId = req.auth?.userId || req.auth?.claims?.sub;
    if (!clerkId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { location, plant_phases, special_plants } = req.body;

    // Get or create user with proper error handling
    const user = await getOrCreateUser(clerkId);

    // Check if user exists before accessing properties
    if (!user || !user.id) {
      console.error('User not found or created for clerkId:', clerkId);
      return res.status(404).json({
        error: 'User not found or could not be created',
        clerkId: clerkId,
      });
    }

    const userId = user.id;

    const profile = await upsertUserProfile(userId, {
      location,
      plant_phases,
      special_plants,
    });

    res.json({
      success: true,
      profile,
    });
  } catch (err) {
    console.error(' ERROR IN /api/users/profile:');
    console.error('Message:', err.message);
    console.error('Stack:', err.stack);
    res.status(500).json({
      error: 'Failed to save profile',
      message: err.message,
    });
  }
});

router.get('/profile-summary', requireAuth, async (req, res) => {
  try {
    const clerkId = req.auth?.userId || req.auth?.claims?.sub;
    if (!clerkId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    console.log('🔄 Fetching profile summary for clerkId:', clerkId);

    const user = await getOrCreateUser(clerkId);

    if (!user || !user.id) {
      return res.status(404).json({ error: 'User not found' });
    }

    const result = await sql`
      SELECT 
        u.id AS user_id,
        u.clerk_id,
        u.email,
        up.location,
        up.plant_phases,
        up.special_plants,
        up.updated_at
      FROM users u
      LEFT JOIN user_profiles up 
      ON u.id = up.user_id
      WHERE u.id = ${user.id}
      LIMIT 1
    `;

    // Handle Neon fullResults: true → result.rows
    const rows = result?.rows ?? result ?? [];

    if (rows.length === 0) {
      console.log('No profile found for user:', user.id);
      return res.json({
        user_id: user.id,
        clerk_id: user.clerk_id,
        location: null,
        plant_phases: [],
        special_plants: [],
      });
    }

    const data = rows[0];
    console.log('Profile summary returned:', data);

    res.json(data);
  } catch (err) {
    console.error(' ERROR IN /api/users/profile-summary:', err.message);
    console.error('Stack:', err.stack);
    res.status(500).json({
      error: 'Failed to fetch profile summary',
      message: err.message,
    });
  }
});

export default router;
