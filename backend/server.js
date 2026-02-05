import dotenv from "dotenv";
import express from "express";
import { sql } from "./config/db.js";

dotenv.config();
const app = express();
app.use(express.json);
const PORT = process.env.port || 5001;

async function initDB() {
  try {
    await sql`CREATE TABLE IF NOT EXISTS transaction(
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        title VARCHAR(255) NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        categories VARCHAR(255) NOT NULL,
        created_at DATE NOT NULL DEFAULT CURRENT_DATE
        )`;
    console.log("DB initaitized successfully...");
  } catch (error) {
    console.log("error initaitizing DB...", error);
    process.exit(1);
  }
}

app.post("/api/tramsaction", async (res, req) => {
  try {
    const { title, amount, categories, user_id } = req.body;
  } catch (error) {}
});

initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is Running on PORT:${PORT}`);
  });
});
