// --- File: backend/server.js ---
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config(); // Load .env file for local development
const app = express();

// --- Middleware Setup ---
// CORS configuration - Allow requests from frontend URL or localhost
const corsOptions = { origin: process.env.FRONTEND_URL || "http://localhost:3000" };
app.use(cors(corsOptions));
// Body Parsers for JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Database Initialization & Models ---
// Import the configured Sequelize instance and models
// Ensure ./models/index.js is set up to handle process.env.DATABASE_URL with SSL for Render
const db = require("./models");
// Get a reference to the Role model for seeding
const Role = db.role;

// --- Function to Seed Initial Roles ---
// Adds default roles to the database if they don't exist
async function initialRoles() {
  try {
    // Check if any roles already exist
    const count = await Role.count();
    if (count === 0) {
      // Create default roles if the table is empty
      await Role.bulkCreate([{ name: "user" }, { name: "admin" }, { name: "budtender" }]);
      console.log("Added initial roles to database.");
    }
  } catch (error) {
    console.error("Error seeding initial roles:", error);
    // Optional: Decide if this error should stop the server startup by throwing it
    // throw error;
  }
}

// --- API Routes Setup ---
// Define a simple root route
app.get("/", (req, res) => res.json({ message: "Welcome to the Budtender Trivia API!" }));

// Load and register all application routes
console.log("Loading routes...");
require('./routes/trivia.routes')(app);
console.log("Trivia routes loaded.");
require('./routes/auth.routes')(app);
console.log("Auth routes loaded.");
require('./routes/score.routes')(app);
console.log("Score routes loaded.");
require('./routes/stats.routes')(app);
console.log("Stats routes loaded.");
require('./routes/user.routes')(app);
console.log("User routes loaded.");
require('./routes/invite.routes')(app);
console.log("Invite routes loaded.");

// --- Global Error Handler Middleware ---
// IMPORTANT: This must be placed *after* all route definitions to catch their errors
const { errorHandler } = require("./middleware");
app.use(errorHandler);

// --- Robust Application Startup Sequence ---
const startServer = async () => {
  try {
    // 1. Synchronize Database Schema
    // Ensure models/index.js is correctly configured for Render's DATABASE_URL and SSL
    // Use { force: true } or { alter: true } ONLY during development if needed for schema changes
    await db.sequelize.sync();
    console.log("Database synced successfully.");

    // 2. Seed Initial Data (e.g., Roles)
    // This runs after the database schema is confirmed to be ready
    await initialRoles();

    // 3. Start Listening for HTTP Requests
    // Use the port specified by Render's environment variable or fallback to 5000 for local dev
    const PORT = process.env.PORT || 5000;
    const server = app.listen(PORT, () => {
      // This log now reliably indicates the server is successfully bound and listening
      console.log(`Budtender Trivia API server running and listening on port ${PORT}.`);
    });

    // Handle potential errors specifically during server listening (e.g., port conflict)
    server.on('error', (error) => {
      console.error('Server failed to start listening:', error);
      process.exit(1); // Exit the process if the server cannot bind the port
    });

  } catch (error) {
    // Catch errors during critical initialization steps (DB Sync, Seeding)
    console.error("Failed to initialize application (DB Sync or Seed Error):", error);
    process.exit(1); // Exit the process if initialization fails, preventing a broken state
  }
};

// --- Execute the Startup Sequence ---
// This initiates the process of syncing the DB, seeding, and starting the server
startServer();
