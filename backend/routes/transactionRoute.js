import express from 'express';
import {
  createTransaction,
  deleteTransaction,
  getSummary,
  getTransactionsByUser,
} from '../controllers/transactionController.js';

const router = express.Router();

router.get('/summary/:user_id', getSummary);
router.get('/:userId', getTransactionsByUser);
router.post('/', createTransaction);
router.delete('/:id', deleteTransaction);

export default router;
