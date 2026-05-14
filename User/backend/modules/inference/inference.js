import axios from 'axios';
import dotenv from 'dotenv';
import FormData from 'form-data';
import fs from 'fs';
import { sql } from '../../config/db.js';

dotenv.config();

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

// Helper to get user from token
const getUserFromToken = async token => {
  if (!token) return null;

  // Verify JWT and get user from database
  const session = await sql`
    SELECT user_id, expires_at 
    FROM user_sessions 
    WHERE token = ${token} AND expires_at > NOW()
  `;

  if (session.length === 0) return null;

  const user = await sql`
    SELECT id, email, name FROM app_users WHERE id = ${session[0].user_id}
  `;

  return user[0] || null;
};

export const detectDisease = async (req, res) => {
  try {
    console.log('🔍 Detection request received');

    const { file } = req;

    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    let token = null;
    let user = null;

    if (authHeader) {
      token = authHeader.replace('Bearer ', '');
      user = await getUserFromToken(token);
    }

    // If no valid user, return 401
    if (!user) {
      // Clean up file if exists
      if (file?.path) {
        try {
          fs.unlinkSync(file.path);
        } catch {}
      }
      return res.status(401).json({ error: 'User not authenticated' });
    }

    console.log('👤 User:', user.email, user.id);

    if (!file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    // AI CALL - FastAPI
    const formData = new FormData();
    formData.append('file', fs.createReadStream(file.path));

    const aiResponse = await axios.post(`${AI_SERVICE_URL}/predict`, formData, {
      headers: { ...formData.getHeaders() },
      timeout: 45000,
    });

    const prediction = aiResponse.data;

    // Check if image validation failed
    if (!prediction.success) {
      if (file.path) {
        try {
          fs.unlinkSync(file.path);
        } catch {}
      }

      return res.status(400).json({
        success: false,
        error: prediction.error,
        error_type: prediction.error_type || 'validation',
        suggestion: prediction.suggestion || 'Please upload a clear photo of a plant leaf',
      });
    }

    const imageUrl = `/uploads/${file.filename}`;

    // Save to PostgreSQL using app_user_id
    const insertResult = await sql`
      INSERT INTO detection_history (
        app_user_id,
        image_url,
        disease_detected,
        confidence,
        damage_severity,
        damage_percentage,
        prediction,
        created_at
      )
      VALUES (
        ${user.id},
        ${imageUrl},
        ${prediction.disease},
        ${prediction.confidence},
        ${prediction.validation?.damage_severity || 'Unknown'},
        ${prediction.validation?.damage_percentage || 0},
        ${JSON.stringify(prediction)},
        NOW()
      )
      RETURNING id;
    `;

    const rows = insertResult?.rows ?? insertResult ?? [];
    const detectionId = rows[0]?.id;

    // Clean up uploaded file
    if (file.path) {
      try {
        fs.unlinkSync(file.path);
      } catch {}
    }

    return res.json({
      success: true,
      disease: prediction.disease,
      confidence: prediction.confidence,
      confidence_percentage: prediction.confidence_percentage,
      prediction_id: detectionId,
      validation: prediction.validation,
      details: prediction.details,
    });
  } catch (error) {
    console.error('Main detection error:', error.message);

    if (error.response?.data) {
      const aiError = error.response.data;
      if (req.file?.path) {
        try {
          fs.unlinkSync(req.file.path);
        } catch {}
      }
      return res.status(error.response.status || 400).json({
        success: false,
        error: aiError.error || aiError.detail || 'AI Service error',
        error_type: aiError.error_type || 'ai_service',
        suggestion: aiError.suggestion || 'Please try again with a clear plant leaf image',
      });
    }

    if (req.file?.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch {}
    }

    return res.status(500).json({
      success: false,
      error: 'Detection failed',
      details: error.message,
      error_type: 'server',
    });
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
