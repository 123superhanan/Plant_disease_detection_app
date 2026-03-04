import { Router } from 'express';
import { sql } from '../../config/db.js';
import { requireAuth } from '../../middleware/clerk.middleware.js';
import { getOrCreateUser, getUserIdByClerkId, upsertUserProfile } from './user.service.js';
const router = Router();

router.get('/me', requireAuth, async (req, res) => {
  try {
    console.log('Request reached /me route');
    console.log('req.auth:', req.auth);

    const clerkId = req.auth.userId;
    console.log('clerkId extracted:', clerkId);

    const user = await getOrCreateUser(clerkId);
    console.log('User returned:', user);

    res.json(user);
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
    const clerkId = req.auth.userId;
    const { location, plant_phases, special_plants } = req.body;

    const userId = await getUserIdByClerkId(clerkId);
    if (!userId) {
      return res.status(404).json({ error: 'User not found' });
    }

    const profile = await upsertUserProfile(userId, {
      location,
      plant_phases,
      special_plants,
    });

    res.json(profile);
  } catch (err) {
    console.error('ERROR IN /api/users/profile:');
    console.error('Message:', err.message);
    res.status(500).json({ error: 'Failed to save profile', message: err.message });
  }
});
router.get('/profile-summary', requireAuth, async (req, res) => {
  try {
    const clerkId = req.auth.userId;

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
      LEFT JOIN user_profiles up ON u.id = up.user_id
      WHERE u.clerk_id = ${clerkId}
    `;
    const userId = await getUserIdByClerkId(clerkId);
    if (result.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch summary' });
  }
});
export default router;
