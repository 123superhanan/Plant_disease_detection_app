import { verifyToken } from '@clerk/backend';
import axios from 'axios';
import dotenv from 'dotenv';
import FormData from 'form-data';
import fs from 'fs';
import { sql } from '../../config/db.js';
import { getOrCreateUser } from '../users/user.service.js';

dotenv.config();

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

export const detectDisease = async (req, res) => {
  try {
    console.log('🔍 Detection request received');

    const { file } = req;

    const authHeader = req.headers.authorization;
    let clerkId = null;

    if (authHeader) {
      try {
        const token = authHeader.replace('Bearer ', '');
        const session = await verifyToken(token, {
          secretKey: process.env.CLERK_SECRET_KEY,
        });
        clerkId = session.sub;
      } catch (err) {
        console.log('TOKEN INVALID:', err.message);
      }
    }

    console.log('Clerk ID:', clerkId);

    if (!clerkId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

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

    // ========== CHECK IF IMAGE VALIDATION FAILED ==========
    if (!prediction.success) {
      // Clean up uploaded file
      if (file.path) {
        fs.unlinkSync(file.path);
      }

      // Return validation error to frontend
      return res.status(400).json({
        success: false,
        error: prediction.error,
        error_type: prediction.error_type || 'validation',
        suggestion: prediction.suggestion || 'Please upload a clear photo of a plant leaf',
        message: prediction.error,
      });
    }
    // ========== END VALIDATION CHECK ==========

    // Get user from database
    const user = await getOrCreateUser(clerkId);
    const userId = user.id;

    const imageUrl = `/uploads/${file.filename}`;

    // Save to PostgreSQL
    const insertResult = await sql`
      INSERT INTO detection_history (
        user_id,
        image_url,
        disease_detected,
        confidence,
        damage_severity,
        damage_percentage,
        prediction,
        created_at
      )
      VALUES (
        ${userId},
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
    fs.unlinkSync(file.path);

    // Return success response with validation info
    return res.json({
      success: true,
      disease: prediction.disease,
      confidence: prediction.confidence,
      confidence_percentage: prediction.confidence_percentage,
      prediction_id: detectionId,
      validation: prediction.validation, // Includes quality, leaf check, damage info
      details: prediction.details, // Treatment recommendations
    });
  } catch (error) {
    console.error('Main detection error:', error.message);

    // Check if it's an Axios error from FastAPI
    if (error.response?.data) {
      const aiError = error.response.data;

      // Clean up file
      if (req.file?.path) {
        try {
          fs.unlinkSync(req.file.path);
        } catch {}
      }

      // Forward FastAPI validation errors to frontend
      return res.status(error.response.status || 400).json({
        success: false,
        error: aiError.error || aiError.detail || 'AI Service error',
        error_type: aiError.error_type || 'ai_service',
        suggestion: aiError.suggestion || 'Please try again with a clear plant leaf image',
      });
    }

    // Clean up file on general error
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

// Optional: Add endpoint for flower detection
export const detectFlower = async (req, res) => {
  try {
    console.log('🌸 Flower detection request received');

    const { file } = req;
    const authHeader = req.headers.authorization;
    let clerkId = null;

    if (authHeader) {
      try {
        const token = authHeader.replace('Bearer ', '');
        const session = await verifyToken(token, {
          secretKey: process.env.CLERK_SECRET_KEY,
        });
        clerkId = session.sub;
      } catch (err) {
        console.log('TOKEN INVALID:', err.message);
      }
    }

    if (!clerkId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (!file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    // Call FastAPI flower endpoint
    const formData = new FormData();
    formData.append('file', fs.createReadStream(file.path));

    const aiResponse = await axios.post(`${AI_SERVICE_URL}/predict_flower`, formData, {
      headers: { ...formData.getHeaders() },
      timeout: 45000,
    });

    const prediction = aiResponse.data;

    // Clean up file
    if (file.path) {
      fs.unlinkSync(file.path);
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

// Optional: Add endpoint to detect image type (leaf or flower)
export const detectImageType = async (req, res) => {
  try {
    const { file } = req;
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ error: 'Not authenticated' });
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

    // Clean up file
    if (file.path) {
      fs.unlinkSync(file.path);
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
