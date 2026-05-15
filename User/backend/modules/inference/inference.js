import axios from 'axios';
import dotenv from 'dotenv';
import FormData from 'form-data';
import fs from 'fs';
import { sql } from '../../config/db.js';

dotenv.config();

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

export const detectDisease = async (req, res) => {
  try {
    console.log('Detection request received');

    const { file } = req;

    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    console.log('User ID:', req.userId);

    const formData = new FormData();
    formData.append('file', fs.createReadStream(file.path));

    const aiResponse = await axios.post(`${AI_SERVICE_URL}/predict`, formData, {
      headers: { ...formData.getHeaders() },
      timeout: 45000,
    });

    const prediction = aiResponse.data;

    await sql`
      INSERT INTO detection_history (
        app_user_id,
        disease_detected,
        confidence,
        image_url,
        created_at
      )
      VALUES (
        ${req.userId},
        ${prediction.disease || 'Unknown'},
        ${prediction.confidence || 0},
        ${file.filename},
        NOW()
      )
    `;

    if (file.path) {
      try {
        fs.unlinkSync(file.path);
      } catch {}
    }

    return res.json({
      success: true,
      prediction,
    });
  } catch (error) {
    console.error('Detection error:', error.message);

    if (req.file?.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch {}
    }

    return res.status(500).json({
      success: false,
      error: 'Detection failed',
    });
  }
};

// Flower detection with custom auth
export const detectFlower = async (req, res) => {
  try {
    const { file } = req;

    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
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
        fs.unlinkSync(file.path);
      } catch {}
    }

    return res.status(500).json({
      success: false,
      error: 'Flower detection failed',
    });
  }
};

// Image type detection
export const detectImageType = async (req, res) => {
  try {
    const { file } = req;

    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
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
        fs.unlinkSync(file.path);
      } catch {}
    }

    return res.status(500).json({
      error: 'Image type detection failed',
    });
  }
};
