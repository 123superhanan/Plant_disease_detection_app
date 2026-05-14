import bcrypt from 'bcrypt';
import express from 'express';
import jwt from 'jsonwebtoken';
import { sql } from '../../config/db.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';
const JWT_EXPIRY = '7d';

// ====================== REGISTER ======================
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // Check if user exists
    const existing = await sql`SELECT id FROM app_users WHERE email = ${email}`;
    if (existing.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await sql`
      INSERT INTO app_users (email, password_hash, name, created_at)
      VALUES (${email}, ${password_hash}, ${name || null}, NOW())
      RETURNING id, email, name, created_at
    `;

    // Generate JWT
    const token = jwt.sign({ userId: newUser[0].id, email: newUser[0].email }, JWT_SECRET, {
      expiresIn: JWT_EXPIRY,
    });

    // Store session
    await sql`
      INSERT INTO user_sessions (user_id, token, expires_at)
      VALUES (${newUser[0].id}, ${token}, NOW() + INTERVAL '7 days')
    `;

    res.json({
      success: true,
      token,
      user: {
        id: newUser[0].id,
        email: newUser[0].email,
        name: newUser[0].name,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ====================== LOGIN ======================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // Find user
    const user = await sql`SELECT * FROM app_users WHERE email = ${email}`;
    if (user.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const validPassword = await bcrypt.compare(password, user[0].password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login
    await sql`UPDATE app_users SET last_login = NOW() WHERE id = ${user[0].id}`;

    // Generate JWT
    const token = jwt.sign({ userId: user[0].id, email: user[0].email }, JWT_SECRET, {
      expiresIn: JWT_EXPIRY,
    });

    // Store session
    await sql`
      INSERT INTO user_sessions (user_id, token, expires_at)
      VALUES (${user[0].id}, ${token}, NOW() + INTERVAL '7 days')
    `;

    res.json({
      success: true,
      token,
      user: {
        id: user[0].id,
        email: user[0].email,
        name: user[0].name,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ====================== VERIFY TOKEN (Middleware) ======================
export const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.replace('Bearer ', '');

    // Verify JWT
    const decoded = jwt.verify(token, JWT_SECRET);

    // Check if session exists in DB
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
    console.error('Token verification error:', error);
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// ====================== LOGOUT ======================
router.post('/logout', verifyToken, async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader.replace('Bearer ', '');

    await sql`DELETE FROM user_sessions WHERE token = ${token}`;

    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ====================== GET ME ======================
router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await sql`
      SELECT id, email, name, created_at, last_login 
      FROM app_users 
      WHERE id = ${req.userId}
    `;

    res.json({ user: user[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
