import dotenv from 'dotenv';
import express from 'express';
import { initDB, sql } from './config/db.js';
import rateLimiter from './middleware/rateLimiter.js';
import inferenceRoutes from './modules/inference/inference.routes.js';
import userRouter from './modules/users/user.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(rateLimiter);
// Remove or comment out: app.use(express.json());

// Add this instead
app.use(
  express.json({
    limit: '1mb',
    verify: (req, res, buf, encoding) => {
      // Skip parsing if no body expected (GET, HEAD, OPTIONS)
      if (buf.length === 0) return;
      // Let it parse only when body exists
    },
  })
);

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
