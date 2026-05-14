import jwt from 'jsonwebtoken';
import { sql } from '../config/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-this';

export const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.replace('Bearer ', '');

    // Verify JWT
    const decoded = jwt.verify(token, JWT_SECRET);

    // Check if session exists in database
    const session = await sql`
      SELECT user_id FROM user_sessions 
      WHERE token = ${token} AND expires_at > NOW()
    `;

    if (session.length === 0) {
      return res.status(401).json({ error: 'Invalid or expired session' });
    }

    req.userId = decoded.userId;
    req.userEmail = decoded.email;
    next();
  } catch (error) {
    console.error('Token verification error:', error.message);
    return res.status(401).json({ error: 'Invalid token' });
  }
};
