import express from 'express';
import fs from 'fs';
import multer from 'multer';
import path from 'path';
import { detectDisease } from './inference.js';

const router = express.Router();

// Ensure uploads directory exists
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  },
});

// ====================== MAIN DETECTION ROUTE ======================
import { verifyToken } from '@clerk/backend';

router.post('/detect', upload.single('file'), async (req, res) => {
  console.log('=== DETECT ROUTE HIT ===');

  const authHeader = req.headers.authorization;
  console.log('AUTH HEADER:', authHeader);

  let clerkId = null;

  if (authHeader) {
    const token = authHeader.replace('Bearer ', '');

    try {
      const session = await verifyToken(token);
      clerkId = session.sub;
    } catch (err) {
      console.log('TOKEN INVALID:', err.message);
    }
  }

  console.log('USER:', clerkId || 'guest_user');

  // attach user to request so detectDisease can use it
  req.clerkId = clerkId;

  return detectDisease(req, res);
});

// Optional:  test route without file upload (for debugging)
router.get('/debug/auth', (req, res) => {
  console.log('🔐 Debug Auth Route Hit');
  console.log('Authorization Header:', req.headers.authorization ? 'Present' : 'Missing');
  console.log('req.auth from Clerk:', req.auth);

  res.json({
    success: true,
    hasAuth: !!req.auth,
    userId: req.auth?.userId,
    sessionId: req.auth?.sessionId,
    message: req.auth?.userId
      ? 'Authentication working ✅'
      : 'No userId - Check frontend token or Clerk setup',
  });
});

export default router;
