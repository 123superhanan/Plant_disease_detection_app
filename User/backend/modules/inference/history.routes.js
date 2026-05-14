// history.routes.js
import express from 'express';
import { sql } from '../../config/db.js';
import { verifyToken } from '../../middleware/auth.middleware.js';

const router = express.Router();

// GET /api/history - Get user's detection history
router.get('/history', verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    console.log('📜 Fetching history for userId:', userId);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Use app_user_id column
    const historyResult = await sql`
      SELECT 
        id,
        image_url,
        disease_detected,
        confidence,
        prediction::text as prediction,
        created_at
      FROM detection_history 
      WHERE app_user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT 20
    `;

    const history = historyResult?.rows ?? historyResult ?? [];

    const statsResult = await sql`
      SELECT 
        COUNT(*) as total_scans,
        SUM(CASE WHEN disease_detected != 'Healthy' THEN 1 ELSE 0 END) as diseased_scans,
        AVG(confidence) as avg_confidence,
        MAX(created_at) as last_scan
      FROM detection_history 
      WHERE app_user_id = ${userId}
    `;

    const stats = statsResult?.rows?.[0] ?? statsResult?.[0] ?? {};

    console.log(`📜 History returned: ${history.length} records`);

    return res.json({
      success: true,
      history,
      stats: {
        total_scans: Number(stats.total_scans) || 0,
        diseased_scans: Number(stats.diseased_scans) || 0,
        avg_confidence: Number(stats.avg_confidence) || 0,
        last_scan: stats.last_scan || null,
      },
    });
  } catch (error) {
    console.error('❌ History route error:', error.message);
    return res.status(500).json({
      success: false,
      error: error.message,
      history: [],
      stats: { total_scans: 0, diseased_scans: 0, avg_confidence: 0 },
    });
  }
});

export default router;
