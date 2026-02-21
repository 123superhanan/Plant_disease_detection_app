import { Router } from 'express';
import { requireAuth } from '../../middleware/clerk.middleware.js';
import { getOrCreateUser } from './user.service.js';

const router = Router();

router.get('/me', requireAuth, async (req, res) => {
  try {
    const clerkId = req.auth.userId; // From Clerk JWT
    const user = await getOrCreateUser(clerkId); // This inserts into Neon if not exists
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
