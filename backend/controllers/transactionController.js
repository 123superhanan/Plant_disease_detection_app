import { sql } from '../config/db.js';

// Get transactions by user
export const getTransactionsByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const transactions = await sql`
      SELECT * FROM transactions
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `;

    res.status(200).json(transactions);
  } catch (error) {
    console.log('Error getting transactions', error);
    res.status(500).json({ message: 'internal error' });
  }
};

// Create transaction
export const createTransaction = async (req, res) => {
  try {
    const { title, amount, categories, user_id } = req.body;

    if (!title || !categories || !user_id || amount === undefined) {
      return res.status(400).json({ message: 'all fields are required' });
    }

    const result = await sql`
      INSERT INTO transactions (user_id, title, categories, amount)
      VALUES (${user_id}, ${title}, ${categories}, ${amount})
      RETURNING *
    `;

    res.status(201).json(result[0]);
  } catch (error) {
    console.log('Error creating transaction', error);
    res.status(500).json({ message: 'internal error' });
  }
};

// Delete transaction
export const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    if (isNaN(parseInt(id))) {
      return res.status(400).json({ message: 'invalid transaction id' });
    }

    const result = await sql`
      DELETE FROM transactions
      WHERE id = ${id}
      RETURNING *
    `;

    if (result.length === 0) {
      return res.status(404).json({ message: 'no transaction found' });
    }

    res.status(200).json({ message: 'transaction deleted successfully' });
  } catch (error) {
    console.log('Error deleting transaction', error);
    res.status(500).json({ message: 'internal error' });
  }
};

// Get summary
export const getSummary = async (req, res) => {
  try {
    const { user_id } = req.params;

    const balanceResult = await sql`
      SELECT COALESCE(SUM(amount),0) AS balance
      FROM transactions
      WHERE user_id = ${user_id}
    `;

    const incomeResult = await sql`
      SELECT COALESCE(SUM(amount),0) AS income
      FROM transactions
      WHERE user_id = ${user_id} AND amount > 0
    `;

    const expensesResult = await sql`
      SELECT COALESCE(SUM(amount),0) AS expenses
      FROM transactions
      WHERE user_id = ${user_id} AND amount < 0
    `;

    res.status(200).json({
      balance: balanceResult[0].balance,
      income: incomeResult[0].income,
      expenses: expensesResult[0].expenses,
    });
  } catch (error) {
    console.log('Error getting summary', error);
    res.status(500).json({ message: 'internal error' });
  }
};
