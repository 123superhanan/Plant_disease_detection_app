import { Router } from 'express';
import { sql } from '../../config/db.js';
import { requireAuth } from '../../middleware/clerk.middleware.js';
import { getOrCreateUser } from '../users/user.service.js';

const router = Router();

router.post('/inference', requireAuth, async (req, res) => {
  try {
    const clerkId = req.auth.userId;
    const user = await getOrCreateUser(clerkId);

    const { image_url, context_id } = req.body;

    // Step 1. Insert image record with pending status
    const inserted = await sql`
      INSERT INTO images (user_id, context_id, image_url)
      VALUES (${user.id}, ${context_id}, ${image_url})
      RETURNING *
    `;

    const image = inserted[0];

    // Step 2. Simulated AI prediction
    const predictionResult = {
      label: 'healthy',
      confidence: 0.94,
      risk_score: 0.06,
    };

    // Step 3. Update image row with prediction
    await sql`
      UPDATE images
      SET predicted_label = ${predictionResult.label},
          confidence = ${predictionResult.confidence},
          prediction = ${predictionResult},
          status = 'completed'
      WHERE id = ${image.id}
    `;

    res.json({
      image_id: image.id,
      prediction: predictionResult,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
