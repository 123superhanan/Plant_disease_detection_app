import axios from 'axios';
import { sql } from '../../config/db.js';
import { getOrCreateUser } from '../users/user.service.js';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

export const getRecommendation = async (req, res) => {
  try {
    const { location, crop, growth_stage, season } = req.body;
    const clerkId = req.auth?.userId || req.auth?.claims?.sub;

    console.log('Getting recommendation for:', { location, crop, growth_stage, season });

    // 🚀 FIRST: Check if recommendation exists in database
    if (clerkId) {
      const user = await getOrCreateUser(clerkId);

      const existingRec = await sql`
        SELECT recommendation, short_recommendation, updated_at
        FROM user_recommendations
        WHERE user_id = ${user.id} 
          AND crop = ${crop}
          AND growth_stage = ${growth_stage}
          AND season = ${season}
        LIMIT 1
      `;

      const rows = existingRec?.rows ?? existingRec ?? [];

      if (rows.length > 0) {
        const rec = rows[0];
        const hoursSinceUpdate =
          (Date.now() - new Date(rec.updated_at).getTime()) / (1000 * 60 * 60);

        // If less than 24 hours old, return cached version
        if (hoursSinceUpdate < 24) {
          console.log('✅ Returning cached recommendation from database');
          return res.json({
            success: true,
            recommendation: rec.recommendation,
            short_recommendation: rec.short_recommendation,
            season: season,
            crop: crop,
            cached: true,
            fromDb: true,
          });
        }
      }
    }

    // 🚀 SECOND: Generate new recommendation from FastAPI
    const response = await axios.post(`${AI_SERVICE_URL}/recommend`, {
      location,
      crop,
      growth_stage,
      season,
    });

    const recommendation = response.data.recommendation || response.data;
    const shortRecommendation =
      response.data.short_recommendation || recommendation.substring(0, 100);

    // 🚀 THIRD: Save to database
    if (clerkId) {
      try {
        const user = await getOrCreateUser(clerkId);

        await sql`
          INSERT INTO user_recommendations (user_id, crop, growth_stage, season, recommendation, short_recommendation, updated_at)
          VALUES (${user.id}, ${crop}, ${growth_stage}, ${season}, ${recommendation}, ${shortRecommendation}, NOW())
          ON CONFLICT (user_id, crop, growth_stage, season)
          DO UPDATE SET 
            recommendation = EXCLUDED.recommendation,
            short_recommendation = EXCLUDED.short_recommendation,
            updated_at = NOW()
        `;

        console.log('💾 Recommendation saved to database');
      } catch (dbError) {
        console.error('Failed to save recommendation:', dbError.message);
      }
    }

    res.json({
      success: true,
      recommendation: recommendation,
      short_recommendation: shortRecommendation,
      season: season,
      crop: crop,
      cached: false,
    });
  } catch (error) {
    console.error('Recommendation error:', error.message);

    // Fallback recommendation
    res.json({
      success: false,
      recommendation: `For ${req.body.crop || 'your crop'} in ${req.body.growth_stage || 'current'} stage: Water regularly, ensure proper sunlight, and monitor for pests.`,
      season: req.body.season,
      crop: req.body.crop,
      fallback: true,
    });
    const shortRecommendation =
      response.data.short_recommendation ||
      (recommendation ? recommendation.substring(0, 100) : 'Recommendation available');
  }
};