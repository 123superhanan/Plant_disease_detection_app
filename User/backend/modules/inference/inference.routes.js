// import { Router } from 'express';
// import multer from 'multer';
// import { sql } from '../../config/db.js';
// import { runRealInference } from '../inference/inference.js'; // your real model

// import { requireAuth } from '../../middleware/clerk.middleware.js';
// import { getOrCreateUser } from '../users/user.service.js';

// const router = Router();
// const upload = multer({ storage: multer.memoryStorage() });

// router.post('/inference', requireAuth, upload.single('image'), async (req, res) => {
//   try {
//     if (!req.file) throw new Error('No image provided');

//     const clerkId = req.auth.userId;
//     const user = await getOrCreateUser(clerkId);

//     // Upload image → get URL (implement this!)
//     const imageUrl = await uploadImageToStorage(req.file.buffer, req.file.originalname);

//     const { context_id } = req.body;

//     const inserted = await sql`
//       INSERT INTO images (user_id, context_id, image_url, status)
//       VALUES (${user.id}, ${context_id || null}, ${imageUrl}, 'pending')
//       RETURNING id
//     `;

//     const imageId = inserted[0].id;

//     const prediction = await runRealInference(req.file.buffer);

//     await sql`
//       UPDATE images
//       SET 
//         predicted_label = ${prediction.label},
//         confidence = ${prediction.confidence},
//         risk_score = ${prediction.risk_score},
//         prediction = ${prediction},
//         status = 'completed',
//         updated_at = NOW()
//       WHERE id = ${imageId}
//     `;

//     res.json({
//       image_id: imageId,
//       prediction,
//     });
//   } catch (err) {
//     console.error('Inference error:', err);
//     res.status(500).json({ error: err.message || 'Failed to process image' });
//   }
// });

// export default router;
