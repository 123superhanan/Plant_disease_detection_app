// history.routes.js
import express from 'express';
import { sql } from '../../config/db.js';
import { verifyToken } from '../../middleware/auth.middleware.js';

const router = express.Router();

// GET /api/history - Get user's detection history
router.get('/history', verifyToken, async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const history = await sql`
      SELECT id, image_url, disease_detected, confidence, created_at
      FROM detection_history
      WHERE app_user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT 20
    `;

    const stats = await sql`
      SELECT
        COUNT(*) as total_scans,
        SUM(CASE WHEN disease_detected != 'Healthy' THEN 1 ELSE 0 END) as diseased_scans,
        AVG(confidence) as avg_confidence
      FROM detection_history
      WHERE app_user_id = ${userId}
    `;

    return res.json({
      success: true,
      history: history?.rows ?? history ?? [],
      stats: stats?.rows?.[0] ?? stats?.[0] ?? {},
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

export default router;
