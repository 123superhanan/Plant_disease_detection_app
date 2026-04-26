import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { sql } from '../../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

export const detectDisease = async (req, res) => {
  try {
    console.log('🔍 Detection request received');

    const { file } = req;
    const userId = req.auth?.userId;

    if (!file) {
      console.log('❌ No file uploaded');
      return res.status(400).json({ error: 'No image uploaded' });
    }

    console.log(`📸 File received: ${file.originalname}`);
    console.log(`📡 Calling AI service at: ${AI_SERVICE_URL}/predict`);

    // 1. Call AI Service (FastAPI)
    const formData = new FormData();
    formData.append('file', fs.createReadStream(file.path));

    const aiResponse = await axios.post(`${AI_SERVICE_URL}/predict`, formData, {
      headers: { ...formData.getHeaders() },
      timeout: 30000,
    });

    console.log('✅ AI Service response received');
    const prediction = aiResponse.data;

    // 2. Save to Neon DB (if user is authenticated)
    if (userId) {
      try {
        const userResult = await sql`
          SELECT id FROM users WHERE clerk_id = ${userId}
        `;

        if (userResult && userResult.length > 0) {
          const imageUrl = `/uploads/${file.filename}`;

          await sql`
            INSERT INTO detection_history (user_id, image_url, disease_detected, confidence, prediction)
            VALUES (
              ${userResult[0].id}, 
              ${imageUrl},
              ${prediction.disease},
              ${prediction.confidence},
              ${JSON.stringify(prediction)}
            )
          `;
          console.log('💾 Prediction saved to database');
        }
      } catch (dbError) {
        console.error('Database error:', dbError.message);
        // Don't fail the request if DB save fails
      }
    }

    // 3. Clean up temp file
    try {
      fs.unlinkSync(file.path);
      console.log('🗑️ Temp file deleted');
    } catch (unlinkError) {
      console.error('Error deleting temp file:', unlinkError.message);
    }

    // 4. Return to React Native
    res.json({
      success: true,
      disease: prediction.disease,
      disease_name: prediction.disease,
      confidence: prediction.confidence,
      confidence_percentage:
        prediction.confidence_percentage || `${(prediction.confidence * 100).toFixed(1)}%`,
      recommendations: prediction.recommendations,
      prediction_id: prediction.prediction_id,
    });
  } catch (error) {
    console.error('❌ Detection error details:');
    console.error('Message:', error.message);

    if (error.code === 'ECONNREFUSED') {
      console.error('❌ FastAPI service is not running on port 8000!');
      console.error('Start it with: cd Plant_Ai_service && python app.py');
      return res.status(500).json({
        error: 'AI Service not available',
        details: 'FastAPI server is not running on port 8000',
      });
    }

    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
      return res.status(error.response.status).json({
        error: 'AI Service error',
        details: error.response.data,
      });
    }

    res.status(500).json({
      error: 'Detection failed',
      details: error.message,
    });
  }
};
