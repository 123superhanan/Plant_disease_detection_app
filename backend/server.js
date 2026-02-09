import dotenv from "dotenv";
import express from "express";
import { sql } from "./config/db.js";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 5001;
//initialize db with schema
async function initDB() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        title VARCHAR(255) NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        categories VARCHAR(255) NOT NULL,
        created_at DATE NOT NULL DEFAULT CURRENT_DATE
      )
    `;
    console.log("DB initialized successfully...");
  } catch (error) {
    console.log("Error initializing DB...", error);
    process.exit(1);
  }
}
//get request
app.get("/", (req, res) => {
  res.sent("damn now the sky is opalite");
});

app.get("/api/transaction/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const transactions = await sql`
    SELECT * FROM transactions WHERE user_id = ${userId} ORDER BY created_at DESC
    `;
    res.status(200).json(transactions);
    console.log(userid);
  } catch (error) {
    console.log("Error getting the transaction", error);
    res.status(500).json({ message: "internal error" });
  }
});

//post request
app.post("/api/transaction", async (req, res) => {
  try {
    const { title, amount, categories, user_id } = req.body;

    if (!title || !categories || !user_id || amount === undefined) {
      return res.status(400).json({ message: "all fields are required" });
    }

    const transactions = await sql`
      INSERT INTO transactions (user_id, title, categories, amount)
      VALUES (${user_id}, ${title}, ${categories}, ${amount})
      RETURNING *
    `;

    console.log(transactions);
    res.status(201).json(transactions[0]);
  } catch (error) {
    console.log("Error creating the transaction", error);
    res.status(500).json({ message: "internal error" });
  }
});

//delete request
app.delete("/api/transaction/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (isNaN(parseInt(id))) {
      return res.status(400).json({ message: "invalid transactions id" });
    }

    const result = await sql`
      DELETE  FROM transactions WHERE user_id = ${id} RETURNING *
    `;
    if (result.length === 0) {
      return res.status(404).json({ message: "no transactions found" });
    }
    res.status(201).json({ message: " transactions deleted sucessfully" });
  } catch (error) {
    console.log("Error deleting the transaction", error);
    res.status(500).json({ message: "internal error" });
  }
});

app.get("/api/transaction/summary/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;
    const balanceResult = await sql`
      SELECT COALESCE(SUM(amount),0) as balance FROM transactions WHERE user_id = ${user_id}
    `;
    const incomeResult = await sql`
      SELECT COALESCE(SUM(amount),0) as income FROM transactions WHERE user_id = ${user_id} AND amount > 0
    `;

    const expensesResult = await sql`
      SELECT COALESCE(SUM(amount),0) as expenses FROM transactions WHERE user_id = ${user_id} AND amount < 0
    `;

    res
      .status(200)
      .json({
        balance: balanceResult[0].balance,
        income: incomeResult[0].income,
        expenses: expensesResult[0].expenses,
      });
  } catch (error) {
    console.log("Error getting summary", error);
    res.status(500).json({ message: "internal error" });
  }
});

initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on PORT:${PORT}`);
  });
});
