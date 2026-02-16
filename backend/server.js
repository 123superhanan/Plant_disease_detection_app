import dotenv from 'dotenv';
import express from 'express';
import { initDB, sql } from './config/db.js';
import rateLimiter from './middleware/rateLimiter.js';
import transactionRouter from './routes/transactionRoute.js';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(rateLimiter);
app.use(express.json());
await app.get('/health', async (req, res) => {
  const result = await sql`SELECT NOW()`;
  res.json(result);
});

app.use('/api/transactions', transactionRouter);

initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
