require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { pool: db } = require("./database.js"); // Ensure this points to your database setup
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors()); // Enable CORS
app.use(express.json()); // Middleware to parse JSON bodies

// Fetching all questions with their options
app.get("/api/questions", async (req, res) => {
  try {
    const [questions] = await db.query(
      "SELECT id, question_text FROM questions"
    );
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: "Database error", error: error.message });
  }
});

// Recording a response
app.post("/api/responses/:optionId", async (req, res) => {
  const { optionId } = req.params;
  if (!optionId) {
    return res.status(400).json({ message: "Option ID is required" });
  }

  try {
    await db.query("UPDATE options SET count = count + 1 WHERE id = ?", [
      optionId,
    ]);
    const [option] = await db.query("SELECT * FROM options WHERE id = ?", [
      optionId,
    ]);
    const [result] = await db.query(
      "SELECT SUM(count) AS total_value FROM options WHERE question_id = ?",
      [option?.[0]?.question_id]
    );
    const [options] = await db.query(
      "SELECT * FROM options WHERE question_id = ?",
      [req.params.questionId]
    );
    const totalValue = result[0]?.total_value ?? 0;
    const optionsMapped = options.map((o) => ({
      ...o,
      percentage: o?.count > 0 ? ((o?.count / totalValue) * 100).toFixed(2) : 0,
    }));
    res.status(201).json(optionsMapped);
  } catch (error) {
    res.status(500).json({ message: "Database error", error: error.message });
  }
});

// Retrieving responses for a specific question
app.get("/api/responses/:questionId", async (req, res) => {
  try {
    const [options] = await db.query(
      "SELECT * FROM options WHERE question_id = ?",
      [req.params.questionId]
    );
    const [result] = await db.query(
      "SELECT SUM(count) AS total_value FROM options WHERE question_id = ?",
      [req.params.questionId]
    );
    const totalValue = result[0]?.total_value ?? 0;
    const optionsMapped = options.map((o) => ({
      ...o,
      percentage: o?.count > 0 ? ((o?.count / totalValue) * 100).toFixed(2) : 0,
    }));
    res.json(optionsMapped);
  } catch (error) {
    res.status(500).json({ message: "Database error", error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
