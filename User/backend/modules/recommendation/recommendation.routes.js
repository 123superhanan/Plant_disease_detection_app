import express from 'express';
import { getRecommendation } from './recommendation.js';

const router = express.Router();

router.post('/predict', getRecommendation);

export default router;
