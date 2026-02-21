import { Router } from 'express';
import { requireAuth } from '../../middleware/clerk.middleware.js';
import { getOrCreateUser } from './user.service.js';

const router = Router();

router.get('/me', requireAuth, async (req, res) => {
  try {
    console.log('Request reached /me route');
    console.log('req.auth:', req.auth); // check if auth middleware worked

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
      code: err.code, // useful for Postgres errors
    });
  }
});

export default router;
