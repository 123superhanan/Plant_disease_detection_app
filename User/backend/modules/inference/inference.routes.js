import express from 'express';
import multer from 'multer';
import { detectDisease } from './inference.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// POST /api/detect - Already being called from your React Native
router.post('/detect', upload.single('file'), detectDisease);

export default router;
