import express from 'express';
import { sql } from '../../config/db.js';

const router = express.Router();

// GET /api/history - Get user's detection history
router.get('/history', async (req, res) => {
  try {
    const userId = req.auth?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get user's detection history
    const history = await sql`
      SELECT * FROM detection_history 
      WHERE user_id = (SELECT id FROM users WHERE clerk_id = ${userId})
      ORDER BY created_at DESC
    `;

    // Get user statistics
    const stats = await sql`
      SELECT 
        COUNT(*) as total_scans,
        SUM(CASE WHEN disease_detected != 'Healthy' THEN 1 ELSE 0 END) as diseased_scans,
        AVG(confidence) as avg_confidence,
        MAX(created_at) as last_scan
      FROM detection_history 
      WHERE user_id = (SELECT id FROM users WHERE clerk_id = ${userId})
    `;

    res.json({
      history: history || [],
      stats: stats[0] || { total_scans: 0, diseased_scans: 0, avg_confidence: 0 },
    });
  } catch (error) {
    console.error('History error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/history/:id - Get single detection by ID
router.get('/history/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.auth?.userId;

    const result = await sql`
      SELECT * FROM detection_history 
      WHERE id = ${id} 
      AND user_id = (SELECT id FROM users WHERE clerk_id = ${userId})
    `;

    if (result.length === 0) {
      return res.status(404).json({ error: 'Detection not found' });
    }

    res.json(result[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/history/:id - Delete a detection
router.delete('/history/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.auth?.userId;

    await sql`
      DELETE FROM detection_history 
      WHERE id = ${id} 
      AND user_id = (SELECT id FROM users WHERE clerk_id = ${userId})
    `;

    res.json({ success: true, message: 'Detection deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/history/feedback - Save user feedback on prediction
router.post('/history/feedback', async (req, res) => {
  try {
    const { detection_id, correct, actual_disease } = req.body;
    const userId = req.auth?.userId;

    // Store feedback for model improvement
    await sql`
      INSERT INTO model_feedback (detection_id, user_id, correct, actual_disease)
      VALUES (${detection_id}, (SELECT id FROM users WHERE clerk_id = ${userId}), ${correct}, ${actual_disease})
    `;

    res.json({ success: true, message: 'Feedback saved' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
