import { Router } from 'express';
import { sql } from '../../config/db.js';
import { requireAuth } from '../../middleware/clerk.middleware.js';
import { getOrCreateUser, upsertUserProfile } from './user.service.js';

const router = Router();

router.get('/me', requireAuth, async (req, res) => {
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
