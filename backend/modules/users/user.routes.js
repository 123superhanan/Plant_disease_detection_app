import { Router } from 'express';
import { requireAuth } from '../../middleware/clerk.middleware.js';
import { getOrCreateUser } from './user.service.js';

const router = Router();

router.get('/me', requireAuth, async (req, res) => {
  try {
    const clerkId = req.auth.userId;

    const user = await getOrCreateUser(clerkId);

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
