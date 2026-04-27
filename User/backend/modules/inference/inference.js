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
    const clerkId = req.auth?.userId || req.auth?.sessionClaims?.sub || 'guest_user';

    console.log('🔐 Clerk/Guest ID:', clerkId);

    if (!file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    // 1. AI Prediction
    const formData = new FormData();
    formData.append('file', fs.createReadStream(file.path));

    const aiResponse = await axios.post(`${AI_SERVICE_URL}/predict`, formData, {
      headers: { ...formData.getHeaders() },
      timeout: 45000,
    });

    const prediction = aiResponse.data;
    console.log('📊 Prediction:', {
      disease: prediction.disease,
      confidence: prediction.confidence,
    });

    // 2. Get or Create User + Save Detection (using your helper)
    let detectionId = null;
    try {
      console.log('💾 Saving detection to database...');

      // Use your robust getOrCreateUser function
      const user = await getOrCreateUser(clerkId);
      const userId = user.id;

      console.log('→ User ready with ID:', userId);

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
      detectionId = rows[0]?.id;

      console.log('💾 ✅ SUCCESS! Detection saved with ID:', detectionId);
    } catch (dbError) {
      console.error('❌ DATABASE SAVE FAILED:');
      console.error('Message:', dbError.message);
      console.error('Full error:', dbError);
    }

    // 3. Clean up temp file
    try {
      fs.unlinkSync(file.path);
      console.log('🗑️ Temp file deleted');
    } catch (e) {
      console.error('Could not delete temp file');
    }

    // 4. Return to React Native
    res.json({
      success: true,
      disease: prediction.disease,
      disease_name: prediction.disease,
      confidence: prediction.confidence,
      confidence_percentage: `${(prediction.confidence * 100).toFixed(1)}%`,
      recommendations: prediction.recommendations || [],
      prediction_id: detectionId,
    });
  } catch (error) {
    console.error('❌ Main detection error:', error.message);
    if (req.file?.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch {}
    }
    res.status(500).json({ error: 'Detection failed', details: error.message });
  }
};
