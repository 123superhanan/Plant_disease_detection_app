import express from 'express';
import { verifyToken } from '../../middleware/auth.middleware.js';
import { getRecommendation } from './recommendation.js';

const router = express.Router();

router.post('/predict', verifyToken, getRecommendation);

export default router;
