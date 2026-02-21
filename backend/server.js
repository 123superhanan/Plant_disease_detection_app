import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import { initDB, sql } from './config/db.js';
import rateLimiter from './middleware/rateLimiter.js';
import inferenceRoutes from './modules/inference/inference.routes.js';
import userRouter from './modules/users/user.routes.js';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;
app.use(
  cors({
    origin: ['http://localhost:8081', 'http://localhost:19006'], // Expo web ports
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);
app.use(rateLimiter);

app.use(express.json());

app.use('/api/users', userRouter);
app.use('/api', inferenceRoutes);

// Health check route - no await needed here
app.get('/health', async (req, res) => {
  try {
    const result = await sql`SELECT NOW()`;
    res.json({ status: 'ok', timestamp: result[0].now });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: 'Database connection failed' });
  }
});
app.get('/api/debug/users', async (req, res) => {
  try {
    const users = await sql`SELECT * FROM users ORDER BY created_at DESC LIMIT 10`;
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
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
