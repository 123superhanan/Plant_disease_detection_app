import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import { initDB, sql } from './config/db.js';

// Routes
import adminRoutes from './modules/admin/admin.routes.js';
import authRoutes from './modules/auth/auth.routes.js';
import historyRoutes from './modules/inference/history.routes.js';
import inferenceRoutes from './modules/inference/inference.routes.js';
import recommendationRoutes from './modules/recommendation/recommendation.routes.js';
import userRoutes from './modules/users/user.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// ====================== MIDDLEWARE ======================
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use(
  cors({
    origin: [
      'http://localhost:8081',
      'http://localhost:19006',
      'http://localhost:8000',
      'http://localhost:3000',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

// ====================== PUBLIC ROUTES (No Auth) ======================
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// ====================== PROTECTED ROUTES (Require Auth) ======================
app.use('/api', inferenceRoutes); // Has its own verifyToken middleware
app.use('/api/recommendation', recommendationRoutes); // Has its own verifyToken middleware
app.use('/api', historyRoutes); // Has its own verifyToken middleware
app.use('/api/admin', adminRoutes); // Has its own verifyToken middleware

// ====================== DEBUG ENDPOINTS (Remove in production) ======================
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

app.get('/api/debug/auth', (req, res) => {
  res.json({
    message: 'Custom auth is running',
    headersReceived: !!req.headers.authorization,
  });
});

// ====================== HEALTH CHECK ======================
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ====================== START SERVER ======================
initDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📍 Auth API: http://localhost:${PORT}/api/auth`);
      console.log(`📍 Health check: http://localhost:${PORT}/health`);
    });
  })
  .catch(error => {
    console.error('❌ Failed to initialize database:', error);
    process.exit(1);
  });
