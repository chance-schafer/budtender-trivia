// --- File: backend/server.js ---
// UPDATED: Added stats routes require AND user routes require
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();
const app = express();

// Middleware
const corsOptions = { origin: process.env.FRONTEND_URL || "http://localhost:3000" };
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database Initialization & Sync
const db = require("./models");
const Role = db.role;
const syncDatabase = async () => {
  try {
    await db.sequelize.sync()
    console.log("Database synced successfully.");
    await initialRoles(); // Seed roles if needed
  } catch (error) {
    console.error("Failed to sync database:", error);
  }
};
syncDatabase(); // Call the sync function

// Function to seed initial roles into the database
async function initialRoles() {
  try {
    const count = await Role.count();
    if (count === 0) {
      await Role.bulkCreate([{ name: "user" }, { name: "admin" }, { name: "budtender" }]);
      console.log("Added initial roles to database.");
    }
  } catch (error) {
    console.error("Error seeding initial roles:", error);
  }
}

// API Routes
app.get("/", (req, res) => res.json({ message: "Welcome to the Budtender Trivia API! DB Initialized." }));
console.log("Loading routes...");
require('./routes/trivia.routes')(app);
console.log("Trivia routes loaded.");
require('./routes/auth.routes')(app); // Registers the auth routes
console.log("Auth routes loaded.");
require('./routes/score.routes')(app);
console.log("Score routes loaded.");
require('./routes/stats.routes')(app);
console.log("Stats routes loaded.");
require('./routes/user.routes')(app); // <-- ADD THIS LINE
console.log("User routes loaded.");   // <-- Optional log
require('./routes/invite.routes')(app); // <-- ADD THIS LINE
console.log("Invite routes loaded.");   // <-- Optional log

// Global Error Handler Middleware
const { errorHandler } = require("./middleware");
app.use(errorHandler); // <-- ADD THIS LINE TO ACTUALLY USE THE HANDLER

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Budtender Trivia API server running on port ${PORT}.`));

// Optional: Add error handling for the listen call itself
app.on('error', (error) => {
  console.error('Server failed to start:', error);
  process.exit(1); // Exit if the server can't start listening
});