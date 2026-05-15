// inference.routes.js
import express from 'express';
import fs from 'fs';
import multer from 'multer';
import path from 'path';
import { verifyToken } from '../../middleware/auth.middleware.js';
import { detectDisease } from './inference.js';
const router = express.Router();

const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } });

// ✅ Remove any verifyToken middleware here
router.post('/detect', verifyToken, upload.single('file'), detectDisease);

export default router;
