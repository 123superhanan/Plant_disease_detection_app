import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import { sql } from '../../config/db.js';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

export const detectDisease = async (req, res) => {
  try {
    const { file } = req;
    const userId = req.auth?.userId; // From Clerk auth

    if (!file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    // 1. Call AI Service (FastAPI)
    const formData = new FormData();
    formData.append('file', fs.createReadStream(file.path));

    const aiResponse = await axios.post(`${AI_SERVICE_URL}/predict`, formData, {
      headers: { ...formData.getHeaders() },
    });

    const prediction = aiResponse.data;

    // 2. Save to Neon DB
    const imageUrl = `https://your-storage.com/${file.filename}`; // Or upload to cloud

    const result = await sql`
      INSERT INTO detection_history (user_id, image_url, disease_detected, confidence, prediction)
      VALUES (
        (SELECT id FROM users WHERE clerk_id = ${userId}), 
        ${imageUrl},
        ${prediction.disease},
        ${prediction.confidence},
        ${JSON.stringify(prediction)}
      )
      RETURNING id;
    `;

    // 3. Clean up temp file
    fs.unlinkSync(file.path);

    // 4. Return to React Native
    res.json({
      success: true,
      disease_name: prediction.disease,
      confidence: prediction.confidence_percentage,
      recommendations: prediction.recommendations,
      prediction_id: result[0]?.id,
    });
  } catch (error) {
    console.error('Detection error:', error);
    res.status(500).json({ error: 'Detection failed' });
  }
};
