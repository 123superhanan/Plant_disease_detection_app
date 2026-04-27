import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import { initDB } from './config/db.js';
//import rateLimiter from './middleware/rateLimiter.js';
import inferenceRoutes from './modules/inference/inference.routes.js';
import recommendationRoutes from './modules/recommendation/recommendation.routes.js';
import userRouter from './modules/users/user.routes.js';
// Add these imports
import adminRoutes from './modules/inference/admin.routes.js';
import historyRoutes from './modules/inference/history.routes.js';

dotenv.config();

const app = express();

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const PORT = process.env.PORT || 5001;

app.use(
  cors({
    origin: ['http://localhost:8081', 'http://localhost:19006', 'http://localhost:8000'], // Added AI service port
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);
// app.use(rateLimiter);

app.use(express.json());

app.use('/api/users', userRouter);
app.use('/api', inferenceRoutes);
app.use('/api/recommendation', recommendationRoutes);
app.use('/api', historyRoutes); // For user history
app.use('/api', adminRoutes); // For admin dashboard

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
