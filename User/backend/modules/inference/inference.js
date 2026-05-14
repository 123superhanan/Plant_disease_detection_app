import axios from 'axios';
import dotenv from 'dotenv';
import FormData from 'form-data';
import fs from 'fs';
import { sql } from '../../config/db.js';

dotenv.config();

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

// Helper to get user from token
const getUserFromToken = async token => {
  if (!token || token === 'null') return null;

  try {
    const session = await sql`
      SELECT user_id, expires_at 
      FROM user_sessions 
      WHERE token = ${token} AND expires_at > NOW()
    `;

    const sessionRows = session?.rows ?? session ?? [];
    if (sessionRows.length === 0) return null;

    const user = await sql`
      SELECT id, email, name FROM app_users WHERE id = ${sessionRows[0].user_id}
    `;

    const userRows = user?.rows ?? user ?? [];
    return userRows[0] || null;
  } catch (error) {
    console.error('getUserFromToken error:', error.message);
    return null;
  }
};

export const detectDisease = async (req, res) => {
  try {
    console.log('🔍 Detection request received');

    const { file } = req;

    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    let token = null;
    let user = null;

    if (authHeader && authHeader !== 'Bearer null') {
      token = authHeader.replace('Bearer ', '');
      if (token && token !== 'null') {
        user = await getUserFromToken(token);
      }
    }

    // ✅ Use a default user for testing if no valid user found
    if (!user) {
      console.log('⚠️ No valid user found, using default user for testing');

      // Get or create a default test user
      const defaultUser = await sql`
        SELECT id, email, name FROM app_users WHERE email = 'test@agrivision.com'
      `;
      const defaultUserRows = defaultUser?.rows ?? defaultUser ?? [];

      if (defaultUserRows.length === 0) {
        // Create default user if doesn't exist
        const newUser = await sql`
          INSERT INTO app_users (email, name, created_at)
          VALUES ('test@agrivision.com', 'Test User', NOW())
          RETURNING id, email, name
        `;
        const newUserRows = newUser?.rows ?? newUser ?? [];
        user = newUserRows[0];
      } else {
        user = defaultUserRows[0];
      }

      console.log('👤 Using default user:', user?.email);
    }

    if (!file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    // ... rest of your code (AI CALL, save to DB, etc.)
  } catch (error) {
    console.error('Main detection error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

// Flower detection with custom auth
export const detectFlower = async (req, res) => {
  try {
    console.log('🌸 Flower detection request received');

    const { file } = req;
    const authHeader = req.headers.authorization;
    let user = null;

    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      user = await getUserFromToken(token);
    }

    if (!user) {
      if (file?.path) {
        try {
          fs.unlinkSync(file.path);
        } catch {}
      }
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (!file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    const formData = new FormData();
    formData.append('file', fs.createReadStream(file.path));

    const aiResponse = await axios.post(`${AI_SERVICE_URL}/predict_flower`, formData, {
      headers: { ...formData.getHeaders() },
      timeout: 45000,
    });

    const prediction = aiResponse.data;

    if (file.path) {
      try {
        fs.unlinkSync(file.path);
      } catch {}
    }

    return res.json({
      success: true,
      flower: prediction.flower,
      confidence: prediction.confidence,
      confidence_percentage: prediction.confidence_percentage,
      all_classes: prediction.all_classes,
    });
  } catch (error) {
    console.error('Flower detection error:', error.message);
    if (req.file?.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch {}
    }
    return res.status(500).json({
      success: false,
      error: 'Flower detection failed',
      details: error.message,
    });
  }
};

// Image type detection
export const detectImageType = async (req, res) => {
  try {
    const { file } = req;
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const token = authHeader.replace('Bearer ', '');
    const user = await getUserFromToken(token);

    if (!user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (!file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    const formData = new FormData();
    formData.append('file', fs.createReadStream(file.path));

    const aiResponse = await axios.post(`${AI_SERVICE_URL}/detect-type`, formData, {
      headers: { ...formData.getHeaders() },
      timeout: 15000,
    });

    if (file.path) {
      try {
        fs.unlinkSync(file.path);
      } catch {}
    }

    return res.json(aiResponse.data);
  } catch (error) {
    if (req.file?.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch {}
    }
    return res.status(500).json({
      error: 'Image type detection failed',
      details: error.message,
    });
  }
};
