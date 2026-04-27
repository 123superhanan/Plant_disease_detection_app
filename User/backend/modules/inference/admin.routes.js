import express from 'express';
import { sql } from '../../config/db.js';

const router = express.Router();

// Middleware to check if user is admin (you can add proper admin check)
const isAdmin = async (req, res, next) => {
  const userId = req.auth?.userId;
  // For now, allow all authenticated users
  // In production, check for admin role in users table
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

// GET /api/admin/stats - Overall system statistics
router.get('/admin/stats', isAdmin, async (req, res) => {
  try {
    const stats = await sql`
      SELECT 
        (SELECT COUNT(*) FROM users) as total_users,
        (SELECT COUNT(*) FROM detection_history) as total_scans,
        (SELECT AVG(confidence) FROM detection_history) as avg_confidence,
        (SELECT COUNT(*) FROM detection_history WHERE disease_detected != 'Healthy') as total_diseases_detected,
        (SELECT COUNT(*) FROM detection_history WHERE created_at > NOW() - INTERVAL '7 days') as scans_last_week,
        (SELECT COUNT(*) FROM users WHERE created_at > NOW() - INTERVAL '30 days') as new_users_last_month
    `;

    // Disease distribution
    const diseaseDistribution = await sql`
      SELECT 
        disease_detected,
        COUNT(*) as count
      FROM detection_history
      GROUP BY disease_detected
      ORDER BY count DESC
    `;

    // Daily scans (last 7 days)
    const dailyScans = await sql`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count
      FROM detection_history
      WHERE created_at > NOW() - INTERVAL '7 days'
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `;

    res.json({
      stats: stats[0],
      disease_distribution: diseaseDistribution,
      daily_scans: dailyScans,
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/admin/users - List all users with their scan counts
router.get('/admin/users', isAdmin, async (req, res) => {
  try {
    const users = await sql`
      SELECT 
        u.id,
        u.clerk_id,
        u.email,
        u.created_at,
        COUNT(d.id) as scan_count,
        AVG(d.confidence) as avg_confidence
      FROM users u
      LEFT JOIN detection_history d ON u.id = d.user_id
      GROUP BY u.id
      ORDER BY scan_count DESC
    `;

    res.json({ users });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/admin/detections - All detections with user info
router.get('/admin/detections', isAdmin, async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;

    const detections = await sql`
      SELECT 
        d.*,
        u.email as user_email,
        u.clerk_id
      FROM detection_history d
      LEFT JOIN users u ON d.user_id = u.id
      ORDER BY d.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    const total = await sql`
      SELECT COUNT(*) as count FROM detection_history
    `;

    res.json({
      detections,
      total: total[0].count,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/admin/export - Export data as CSV
router.post('/admin/export', isAdmin, async (req, res) => {
  try {
    const { start_date, end_date, format = 'json' } = req.body;

    let query = `
      SELECT 
        d.created_at,
        u.email as user_email,
        d.disease_detected,
        d.confidence,
        d.health_score,
        d.severity_level
      FROM detection_history d
      LEFT JOIN users u ON d.user_id = u.id
      WHERE 1=1
    `;

    const params = [];
    if (start_date) {
      query += ` AND d.created_at >= $${params.length + 1}`;
      params.push(start_date);
    }
    if (end_date) {
      query += ` AND d.created_at <= $${params.length + 1}`;
      params.push(end_date);
    }

    query += ` ORDER BY d.created_at DESC`;

    const data = await sql(query, params);

    if (format === 'csv') {
      // Convert to CSV
      const headers = ['Date', 'User Email', 'Disease', 'Confidence', 'Health Score', 'Severity'];
      const csvRows = [headers];

      for (const row of data) {
        csvRows.push([
          row.created_at,
          row.user_email || 'Anonymous',
          row.disease_detected,
          row.confidence,
          row.health_score,
          row.severity_level,
        ]);
      }

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=export.csv');
      return res.send(csvRows.map(row => row.join(',')).join('\n'));
    }

    res.json({ data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
