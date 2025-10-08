// --- File: backend/models/index.js ---
'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');
const dbConfig = require('../config/db.config.js'); // Import your config file
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'production'; // Use NODE_ENV
const db = {};

let sequelize;

// --- START: Render DATABASE_URL Integration ---
let shouldUseDatabaseUrl = false;

if (process.env.DATABASE_URL) {
  try {
    const parsedUrl = new URL(process.env.DATABASE_URL);
    const hostname = parsedUrl.hostname || '';

    // Treat any non-empty hostname (including Render's dashed hostnames) as usable and
    // only fall back to the local configuration when the hostname is missing entirely.
    if (hostname) {
      shouldUseDatabaseUrl = true;
    } else {
      console.warn(
        'DATABASE_URL is defined without a hostname. Falling back to db.config.js settings for local development.'
      );
    }
  } catch (error) {
    console.warn(
      'DATABASE_URL is defined but could not be parsed. Falling back to db.config.js settings.',
      error
    );
  }
}

if (shouldUseDatabaseUrl) {
  // If DATABASE_URL is set (like on Render), use it directly
  console.log('Connecting via DATABASE_URL...');
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres', // Specify dialect (Render uses PostgreSQL)
    protocol: 'postgres',
    dialectOptions: {
      ssl: {
        require: true, // Require SSL connection
        rejectUnauthorized: false // Necessary for Render's self-signed certificates
      }
    },
    logging: env === 'development' ? console.log : false, // Log SQL in dev only
    pool: dbConfig.pool // You can still use pool settings from db.config.js
  });
} else {
  // Otherwise, fall back to using the individual config values (for local dev)
  console.log('Connecting using db.config.js settings...');
  sequelize = new Sequelize(
    dbConfig.DB,
    dbConfig.USER,
    dbConfig.PASSWORD,
    {
      host: dbConfig.HOST,
      port: dbConfig.PORT,
      dialect: dbConfig.dialect,
      pool: dbConfig.pool,
      logging: env === 'development' ? console.log : false // Log SQL in dev only
    }
  );
}
// --- END: Render DATABASE_URL Integration ---


// Load all model files from the current directory
fs
  .readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  })
  .forEach(file => {
    // Use require to import the model definition function
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
    console.log(`>>> Loaded model: ${model.name} from ${file}`); // Added logging
  });

// Set up associations if they exist
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    console.log(`>>> Calling associate for model: ${modelName}`); // Added logging
    db[modelName].associate(db);
  } else {
    console.log(`>>> Model ${modelName} does not have an associate method.`); // Added logging
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
