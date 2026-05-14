import { Router } from 'express';
import { sql } from '../../config/db.js';
import { verifyToken } from '../auth/auth.routes.js';
import { getOrCreateUserByEmail, getUserById, upsertUserProfile } from './user.service.js';

const router = Router();

// ====================== GET CURRENT USER ======================
router.get('/me', verifyToken, async (req, res) => {
  try {
    const userId = req.userId;

    console.log('=== /api/users/me route called ===');
    console.log('UserId:', userId);

    if (!userId) {
      return res.status(401).json({
        error: 'Unauthorized - No userId found',
      });
    }

    const user = await getUserById(userId);

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
      });
    }

    console.log('✅ User returned successfully:', user);

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        created_at: user.created_at,
        last_login: user.last_login,
      },
    });
  } catch (err) {
    console.error('ERROR IN /api/users/me:', err.message);

    res.status(500).json({
      error: 'Internal server error',
      message: err.message,
    });
  }
});

// ====================== PUBLIC PROFILE SAVE ======================
router.post('/profile-public', async (req, res) => {
  console.log('🔥 PUBLIC PROFILE ENDPOINT HIT');
  console.log('Received body:', req.body);

  try {
    const { location, plant_phases, special_plants, email } = req.body;

    if (!email) {
      return res.status(400).json({
        error: 'Email is required',
      });
    }

    // Get or create user
    const user = await getOrCreateUserByEmail(email);

    const userId = user.id;

    // Save profile
    const result = await sql`
      INSERT INTO user_profiles (
        user_id,
        location,
        plant_phases,
        special_plants,
        updated_at
      )
      VALUES (
        ${userId},
        ${location},
        ${plant_phases},
        ${special_plants},
        NOW()
      )
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

    res.json({
      success: true,
      profile: rows[0],
    });
  } catch (error) {
    console.error('Error saving profile:', error);

    res.status(500).json({
      error: error.message,
    });
  }
});

// ====================== PUBLIC PROFILE GET ======================
router.get('/profile-summary-public', async (req, res) => {
  console.log('🔥 PUBLIC PROFILE GET ENDPOINT HIT');

  try {
    const { email } = req.query;

    if (!email) {
      return res.json({
        location: null,
        plant_phases: [],
        special_plants: [],
      });
    }

    const user = await getOrCreateUserByEmail(email);

    const userId = user.id;

    const result = await sql`
      SELECT
        u.id AS user_id,
        u.email,
        u.name,
        up.location,
        up.plant_phases,
        up.special_plants,
        up.updated_at
      FROM app_users u
      LEFT JOIN user_profiles up
      ON u.id = up.user_id
      WHERE u.id = ${userId}
      LIMIT 1
    `;

    const rows = result?.rows ?? result ?? [];

    console.log('Profile data:', rows[0]);

    res.json(
      rows[0] || {
        user_id: userId,
        email,
        location: null,
        plant_phases: [],
        special_plants: [],
      }
    );
  } catch (error) {
    console.error('Error fetching profile:', error);

    res.status(500).json({
      error: error.message,
    });
  }
});

// ====================== AUTHENTICATED PROFILE SAVE ======================
router.post('/profile', verifyToken, async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        error: 'Unauthorized',
      });
    }

    const { location, plant_phases, special_plants } = req.body;

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
    console.error('ERROR IN /api/users/profile:', err.message);

    res.status(500).json({
      error: 'Failed to save profile',
      message: err.message,
    });
  }
});

// ====================== AUTHENTICATED PROFILE GET ======================
router.get('/profile-summary', verifyToken, async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        error: 'Unauthorized',
      });
    }

    console.log('🔄 Fetching profile summary for userId:', userId);

    const result = await sql`
      SELECT
        u.id AS user_id,
        u.email,
        u.name,
        up.location,
        up.plant_phases,
        up.special_plants,
        up.updated_at
      FROM app_users u
      LEFT JOIN user_profiles up
      ON u.id = up.user_id
      WHERE u.id = ${userId}
      LIMIT 1
    `;

    const rows = result?.rows ?? result ?? [];

    if (rows.length === 0) {
      console.log('No profile found for user:', userId);

      return res.json({
        user_id: userId,
        location: null,
        plant_phases: [],
        special_plants: [],
      });
    }

    const data = rows[0];

    console.log('Profile summary returned:', data);

    res.json(data);
  } catch (err) {
    console.error('ERROR IN /api/users/profile-summary:', err.message);

    res.status(500).json({
      error: 'Failed to fetch profile summary',
      message: err.message,
    });
  }
});

export default router;
