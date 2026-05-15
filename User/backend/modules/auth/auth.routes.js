import bcrypt from 'bcrypt';
import express from 'express';
import jwt from 'jsonwebtoken';
import { sql } from '../../config/db.js';

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;

const createToken = user => {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

const formatUser = user => ({
  id: user.id,
  email: user.email,
  name: user.name,
});

// REGISTER
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const existing = await sql`
      SELECT id FROM app_users WHERE email = ${email}
    `;

    const rows = existing?.rows ?? existing;

    if (rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const result = await sql`
      INSERT INTO app_users (email, password_hash, name, created_at)
      VALUES (${email}, ${password_hash}, ${name || null}, NOW())
      RETURNING id, email, name
    `;

    const userRows = result?.rows ?? result;
    const user = userRows[0];

    const token = createToken(user);

    res.json({
      success: true,
      token,
      user: formatUser(user),
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const result = await sql`
      SELECT * FROM app_users WHERE email = ${email}
    `;

    const rows = result?.rows ?? result;

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = rows[0];

    const valid = await bcrypt.compare(password, user.password_hash);

    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = createToken(user);

    await sql`
      UPDATE app_users SET last_login = NOW() WHERE id = ${user.id}
    `;

    res.json({
      success: true,
      token,
      user: formatUser(user),
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// MIDDLEWARE
export const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ error: 'No token' });
    }

    const token = authHeader.replace('Bearer ', '');

    const decoded = jwt.verify(token, JWT_SECRET);

    req.userId = decoded.userId;
    req.userEmail = decoded.email;

    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// LOGOUT (CLIENT HANDLES TOKEN DELETE)
router.post('/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Logged out',
  });
});

// ME
router.get('/me', verifyToken, async (req, res) => {
  try {
    const result = await sql`
      SELECT id, email, name, created_at, last_login
      FROM app_users
      WHERE id = ${req.userId}
    `;

    const rows = result?.rows ?? result;

    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
