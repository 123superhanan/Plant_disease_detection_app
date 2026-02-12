import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import { initDB } from './config/db.js';
import transactionRouter from './routes/transactionRoute.js';
import rateLimiter from './middleware/rateLimiter.js';

const app = express();
const PORT = process.env.PORT || 5001;

console.log('Loaded DB:', process.env.DATABASE_URL);

app.use(rateLimiter);
app.use(express.json());

app.get('/health', (req, res) => {
  res.send('Server healthy');
});

app.use('/api/transactions', transactionRouter);

initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
