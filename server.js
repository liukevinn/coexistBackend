require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./database.js'); // Ensure this points to your database setup
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors()); // Enable CORS
app.use(express.json()); // Middleware to parse JSON bodies


// Fetching all questions with their options
app.get('/api/questions', async (req, res) => {
    try {
        const [questions] = await db.query('SELECT * FROM questions');
        for (let question of questions) {
            const [options] = await db.query('SELECT * FROM options WHERE question_id = ?', [question.id]);
            question.options = options;
        }
        res.json(questions);
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
});

// Recording a response
app.post('/api/responses/:optionId', async (req, res) => {
    const { optionId } = req.params;
    if (!optionId) {
        return res.status(400).json({ message: 'Option ID is required' });
    }

    try {
        await db.query('UPDATE options SET count = count + 1 WHERE id = ?', [optionId]);
        res.status(201).json({ message: 'Response recorded' });
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
});


// Retrieving responses for a specific question
app.get('/api/responses/:questionId', async (req, res) => {
    try {
        const [options] = await db.query('SELECT id, count FROM options WHERE question_id = ?', [req.params.questionId]);
        res.json(options);
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
