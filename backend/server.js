import dotenv from 'dotenv';
import express from 'express';
import { initDB, sql } from './config/db.js';
import rateLimiter from './middleware/rateLimiter.js';
import userRoutes from './modules/users/user.routes.js';

import inferenceRoutes from './modules/inference/inference.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(rateLimiter);
app.use(express.json());
app.use('/api', userRoutes);
app.use('/api', inferenceRoutes);
await app.get('/health', async (req, res) => {
  const result = await sql`SELECT NOW()`;
  res.json(result);
});

initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
