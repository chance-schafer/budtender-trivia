// --- File: backend/config/db.config.js ---

// Load environment variables (ensure dotenv is configured in server.js or here)
// require('dotenv').config(); // Optionally load here if not done globally

module.exports = {
    HOST: process.env.DB_HOST || "localhost", // Database host
    USER: process.env.DB_USER || "postgres",  // Database username
    PASSWORD: process.env.DB_PASSWORD || "",  // Database password
    DB: process.env.DB_NAME || "testdb",      // Database name
    dialect: process.env.DB_DIALECT || "postgres", // Database type (dialect for Sequelize)
    PORT: process.env.DB_PORT || 5432,       // Database port
  
    // Sequelize connection pool configuration (optional but recommended)
    pool: {
      max: 5,     // Maximum number of connections in pool
      min: 0,     // Minimum number of connections in pool
      acquire: 30000, // Maximum time (ms) that pool will try to get connection before throwing error
      idle: 10000     // Maximum time (ms) that a connection can be idle before being released
    }
  };
  