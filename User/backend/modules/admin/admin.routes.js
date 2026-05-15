import express from 'express';
import { sql } from '../../config/db.js';

const router = express.Router();

// Get admin stats
router.get('/stats', async (req, res) => {
  try {
    const usersResult = await sql`SELECT COUNT(*) as count FROM app_users`;
    const scansResult = await sql`SELECT COUNT(*) as count FROM detection_history`;
    const diseasedResult =
      await sql`SELECT COUNT(*) as count FROM detection_history WHERE disease_detected != 'Healthy'`;

    // Handle different response formats from Neon
    const totalUsers = usersResult?.[0]?.count || usersResult?.count || 0;
    const totalScans = scansResult?.[0]?.count || scansResult?.count || 0;
    const diseasedScans = diseasedResult?.[0]?.count || diseasedResult?.count || 0;

    res.json({ totalUsers, totalScans, diseasedScans });
  } catch (error) {
    console.error('Stats error:', error);
    res.json({ totalUsers: 0, totalScans: 0, diseasedScans: 0 });
  }
});

// Get all users
router.get('/users', async (req, res) => {
  try {
    const users = await sql`
      SELECT u.id, u.email, u.name, u.created_at, COUNT(d.id) as scan_count
      FROM app_users u
      LEFT JOIN detection_history d ON d.app_user_id = u.id
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `;
    res.json(users);
  } catch (error) {
    console.error('Users error:', error);
    res.json([]);
  }
});

// Get all detections
router.get('/detections', async (req, res) => {
  try {
    const detections = await sql`
      SELECT d.*, u.email as user_email
      FROM detection_history d
      LEFT JOIN app_users u ON d.app_user_id = u.id
      ORDER BY d.created_at DESC
      LIMIT 100
    `;
    res.json(detections);
  } catch (error) {
    console.error('Detections error:', error);
    res.json([]);
  }
});

// Delete detection
router.delete('/detections/:id', async (req, res) => {
  try {
    await sql`DELETE FROM detection_history WHERE id = ${req.params.id}`;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete user
router.delete('/users/:id', async (req, res) => {
  try {
    await sql`DELETE FROM detection_history WHERE app_user_id = ${req.params.id}`;
    await sql`DELETE FROM app_users WHERE id = ${req.params.id}`;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Send notification
// Send notification
router.post('/notify', async (req, res) => {
  try {
    const { userId, title, message } = req.body;

    if (!title || !message) {
      return res.status(400).json({ error: 'Title and message required' });
    }

    if (userId) {
      // Send to specific user
      await sql`
        INSERT INTO notifications (user_id, title, message, created_at)
        VALUES (${userId}, ${title}, ${message}, NOW())
      `;
    } else {
      // Send to all users - handle empty result safely
      const result = await sql`SELECT id FROM app_users`;

      // Check if result has rows
      let users = [];
      if (result && result.rows) {
        users = result.rows;
      } else if (Array.isArray(result)) {
        users = result;
      }

      if (users.length === 0) {
        // No users yet, just return success
        console.log('No users found to send notification');
        return res.json({ success: true, message: 'No users yet' });
      }

      for (const user of users) {
        await sql`
          INSERT INTO notifications (user_id, title, message, created_at)
          VALUES (${user.id}, ${title}, ${message}, NOW())
        `;
      }
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Notify error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
