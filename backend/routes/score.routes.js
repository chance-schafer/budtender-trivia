// backend/routes/scores.js
const express = require('express');
const router = express.Router();
const { Score, User } = require('../models'); // Assuming models are exported from an index.js in models
// or const Score = require('../models/score'); const User = require('../models/user');

// POST a new score
router.post('/', async (req, res) => {
    try {
        const { username, score } = req.body;

        if (!username || score === undefined) {
            return res.status(400).json({ message: "Username and score are required." });
        }

        // Find the user by username to get their ID
        const user = await User.findOne({ where: { username: username } });
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        // Create the score entry with userId
        const newScore = await Score.create({
            userId: user.id,
            score: parseInt(score, 10) // Ensure score is an integer
        });
        res.status(201).json(newScore);
    } catch (error) {
        console.error("Error creating score:", error);
        // Provide more specific error message from Sequelize if available
        const errorMessage = error.errors ? error.errors.map(e => e.message).join(', ') : error.message;
        res.status(500).json({ message: "Failed to submit score/stats.", error: errorMessage });
    }
});

// GET all scores (example, you might want to join with User to get username)
router.get('/', async (req, res) => {
    try {
        const scores = await Score.findAll({
            include: [{
                model: User,
                attributes: ['username'] // Only include username from User model
            }],
            order: [['score', 'DESC']] // Order by score descending
        });
        res.json(scores);
    } catch (error) {
        console.error("Error fetching scores:", error);
        res.status(500).json({ message: "Failed to fetch scores.", error: error.message });
    }
});

module.exports = router;