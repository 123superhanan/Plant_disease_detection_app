import { clerkMiddleware } from '@clerk/express';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import { initDB } from './config/db.js';
//import rateLimiter from './middleware/rateLimiter.js';
import inferenceRoutes from './modules/inference/inference.routes.js';
import recommendationRoutes from './modules/recommendation/recommendation.routes.js';
import userRouter from './modules/users/user.routes.js';
// Add these imports
import { sql } from './config/db.js';
import adminRoutes from './modules/inference/admin.routes.js';
import historyRoutes from './modules/inference/history.routes.js';
dotenv.config();

const app = express();
app.use(
  clerkMiddleware({
    secretKey: process.env.CLERK_SECRET_KEY,
    publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
    // This allows requests without auth to pass through
    // The middleware will still try to authenticate, but won't block
  })
);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const PORT = process.env.PORT || 5001;

app.use(
  cors({
    origin: ['http://localhost:8081', 'http://localhost:19006', 'http://localhost:8000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

// app.use(rateLimiter);

app.use('/api/users', userRouter);
app.use('/api', inferenceRoutes);
app.use('/api/recommendation', recommendationRoutes);
app.use('/api', historyRoutes);
app.use('/api', adminRoutes);

// ... rest of your code remains the same
// Health check route - no await needed here
// app.get('/health', async (req, res) => {
//   try {
//     const result = await sql`SELECT NOW()`;
//     res.json({ status: 'ok', timestamp: result[0].now });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ status: 'error', message: 'Database connection failed' });
//   }
// });
// app.get('/api/debug/users', async (req, res) => {
//   try {
//     const users = await sql`SELECT * FROM users ORDER BY created_at DESC LIMIT 10`;
//     res.json(users);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });
// Debug endpoint - check recent detections
app.get('/api/debug/recent', async (req, res) => {
  try {
    const recent = await sql`
      SELECT * FROM detection_history 
      ORDER BY created_at DESC 
      LIMIT 5
    `;
    res.json({ count: recent.length, recent });
  } catch (error) {
    res.json({ error: error.message });
  }
});
// Test endpoint - add a sample record
app.post('/api/test-add', async (req, res) => {
  try {
    const result = await sql`
      INSERT INTO detection_history (
        user_id, 
        image_url, 
        disease_detected, 
        confidence, 
        prediction,
        created_at
      )
      VALUES (
        'ad3ef401-e8db-461a-8aa3-08fe802fc080',
        '/test-rust.jpg',
        'Rust',
        0.95,
        '{"disease":"Rust","confidence":0.95}',
        NOW()
      )
      RETURNING id;
    `;
    res.json({ success: true, id: result[0]?.id });
  } catch (error) {
    res.json({ error: error.message });
  }
});
// Debug auth endpoint - remove after testing
app.get('/api/debug/auth', (req, res) => {
  console.log('Headers:', req.headers.authorization);
  console.log('Auth object:', req.auth);
  res.json({
    hasAuth: !!req.auth,
    userId: req.auth?.userId,
    headersReceived: !!req.headers.authorization,
  });
});
initDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(error => {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  });
