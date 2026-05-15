import axios from 'axios';
import { sql } from '../../config/db.js';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

export const getRecommendation = async (req, res) => {
  try {
    const { location, crop, growth_stage, season } = req.body;

    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const cached = await sql`
      SELECT recommendation, short_recommendation, updated_at
      FROM user_recommendations
      WHERE user_id = ${userId}
      AND crop = ${crop}
      AND growth_stage = ${growth_stage}
      AND season = ${season}
      LIMIT 1
    `;

    const rows = Array.isArray(cached) ? cached : (cached?.rows ?? []);

    if (rows.length > 0) {
      const rec = rows[0];

      const updatedAt = new Date(rec.updated_at).getTime();

      if (updatedAt) {
        const hours = (Date.now() - updatedAt) / (1000 * 60 * 60);

        if (hours < 24) {
          return res.json({
            success: true,
            recommendation: rec.recommendation,
            short_recommendation: rec.short_recommendation,
            cached: true,
          });
        }
      }
    }

    const response = await axios.post(`${AI_SERVICE_URL}/recommend`, {
      location,
      crop,
      growth_stage,
      season,
    });

    if (!response?.data?.recommendation) {
      throw new Error('AI service returned invalid response');
    }

    const recommendation = response.data.recommendation;
    const shortRecommendation = response.data.short_recommendation || recommendation.slice(0, 120);

    await sql`
      INSERT INTO user_recommendations
      (user_id, crop, growth_stage, season, recommendation, short_recommendation, updated_at)
      VALUES
      (${userId}, ${crop}, ${growth_stage}, ${season}, ${recommendation}, ${shortRecommendation}, NOW())
      ON CONFLICT (user_id, crop, growth_stage, season)
      DO UPDATE SET
        recommendation = EXCLUDED.recommendation,
        short_recommendation = EXCLUDED.short_recommendation,
        updated_at = NOW()
    `;

    return res.json({
      success: true,
      recommendation,
      short_recommendation: shortRecommendation,
      cached: false,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};
