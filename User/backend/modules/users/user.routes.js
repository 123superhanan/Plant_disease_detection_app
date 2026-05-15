import { Router } from 'express';
import jwt from 'jsonwebtoken'; // ✅ Add this import
import { sql } from '../../config/db.js';
import { verifyToken } from '../../middleware/auth.middleware.js';
import { getUserById, upsertUserProfile } from './user.service.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// ====================== GET CURRENT USER ======================
router.get('/me', verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    console.log('=== /api/users/me route called ===');
    console.log('UserId:', userId);

    const user = await getUserById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({
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
    res.status(500).json({ error: 'Internal server error', message: err.message });
  }
});

// ====================== PUBLIC PROFILE SAVE ======================
router.post('/profile-public', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.replace('Bearer ', '');

    // ✅ Now using imported jwt
    const decoded = jwt.verify(token, JWT_SECRET);
    const userEmail = decoded.email;

    // ✅ CREATE USER IF DOESN'T EXIST
    let userId;
    const existingUser = await sql`
      SELECT id FROM app_users WHERE email = ${userEmail}
    `;
    const existingRows = existingUser?.rows ?? existingUser ?? [];

    if (existingRows.length === 0) {
      const newUser = await sql`
        INSERT INTO app_users (email, name, created_at)
        VALUES (${userEmail}, ${decoded.name || null}, NOW())
        RETURNING id
      `;
      const newUserRows = newUser?.rows ?? newUser ?? [];
      userId = newUserRows[0].id;
    } else {
      userId = existingRows[0].id;
    }

    // ✅ NOW save profile with valid user_id
    const { location, plant_phases, special_plants } = req.body;

    const result = await sql`
      INSERT INTO user_profiles (user_id, location, plant_phases, special_plants, updated_at)
      VALUES (${userId}, ${location}, ${plant_phases}, ${special_plants}, NOW())
      ON CONFLICT (user_id) DO UPDATE SET
        location = EXCLUDED.location,
        plant_phases = EXCLUDED.plant_phases,
        special_plants = EXCLUDED.special_plants,
        updated_at = NOW()
      RETURNING *
    `;

    const rows = result?.rows ?? result ?? [];
    res.json({ success: true, profile: rows[0] });
  } catch (error) {
    console.error('Profile save error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ====================== PUBLIC PROFILE GET ======================
router.get('/profile-summary-public', verifyToken, async (req, res) => {
  console.log('🔥 PUBLIC PROFILE GET ENDPOINT HIT');

  try {
    const userId = req.userId; // Get from token instead of email query

    if (!userId) {
      return res.json({
        location: null,
        plant_phases: [],
        special_plants: [],
      });
    }

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
      LEFT JOIN user_profiles up ON u.id = up.user_id
      WHERE u.id = ${userId}
      LIMIT 1
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

// ====================== AUTHENTICATED PROFILE SAVE ======================
router.post('/profile', verifyToken, async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { location, plant_phases, special_plants } = req.body;

    const profile = await upsertUserProfile(userId, {
      location,
      plant_phases,
      special_plants,
    });

    res.json({ success: true, profile });
  } catch (err) {
    console.error('ERROR IN /api/users/profile:', err.message);
    res.status(500).json({ error: 'Failed to save profile', message: err.message });
  }
});

// ====================== AUTHENTICATED PROFILE GET ======================
router.get('/profile-summary', verifyToken, async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
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
      LEFT JOIN user_profiles up ON u.id = up.user_id
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
    res.status(500).json({ error: 'Failed to fetch profile summary', message: err.message });
  }
});

export default router;
