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

    console.log(' Clerk ID:', clerkId);

    if (!clerkId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (!file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    // AI CALL
    const formData = new FormData();
    formData.append('file', fs.createReadStream(file.path));

    const aiResponse = await axios.post(`${AI_SERVICE_URL}/predict`, formData, {
      headers: { ...formData.getHeaders() },
      timeout: 45000,
    });

    const prediction = aiResponse.data;

    // DB
    const user = await getOrCreateUser(clerkId);
    const userId = user.id;

    const imageUrl = `/uploads/${file.filename}`;

    const insertResult = await sql`
      INSERT INTO detection_history (
        user_id,
        image_url,
        disease_detected,
        confidence,
        prediction,
        created_at
      )
      VALUES (
        ${userId},
        ${imageUrl},
        ${prediction.disease},
        ${prediction.confidence},
        ${JSON.stringify(prediction)},
        NOW()
      )
      RETURNING id;
    `;

    const rows = insertResult?.rows ?? insertResult ?? [];
    const detectionId = rows[0]?.id;

    fs.unlinkSync(file.path);

    return res.json({
      success: true,
      disease: prediction.disease,
      confidence: prediction.confidence,
      prediction_id: detectionId,
    });
  } catch (error) {
    console.error(' Main detection error:', error.message);

    if (req.file?.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch {}
    }

    return res.status(500).json({
      error: 'Detection failed',
      details: error.message,
    });
  }
};
