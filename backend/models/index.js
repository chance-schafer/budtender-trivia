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
let databaseUrlError;

if (process.env.DATABASE_URL) {
  try {
    const parsedUrl = new URL(process.env.DATABASE_URL);
    let hostname = parsedUrl.hostname || '';

    // Determine whether the hostname looks resolvable. Render provides a FQDN with a dot.
    // Local development commonly uses localhost or 127.0.0.1 (which we also allow).
    let looksResolvable =
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname.includes('.') ||
      hostname === '';

    if (!looksResolvable && hostname) {
      const explicitSuffix =
        process.env.DATABASE_URL_HOST_SUFFIX ||
        process.env.DB_HOST_SUFFIX ||
        '';

      if (explicitSuffix.trim()) {
        const normalizedSuffix = explicitSuffix.trim().replace(/^\.+/, '');
        parsedUrl.hostname = `${hostname}.${normalizedSuffix}`;
        hostname = parsedUrl.hostname;
        looksResolvable = true;
        console.log(
          `DATABASE_URL hostname appeared partial. Applied configured suffix to use "${hostname}".`
        );
      } else if (process.env.RENDER_REGION) {
        const inferredSuffix = `${process.env.RENDER_REGION}-postgres.render.com`;
        parsedUrl.hostname = `${hostname}.${inferredSuffix}`;
        hostname = parsedUrl.hostname;
        looksResolvable = true;
        console.log(
          `DATABASE_URL hostname appeared partial. Inferred Render hostname "${hostname}" using RENDER_REGION.`
        );
      }

      if (looksResolvable) {
        process.env.DATABASE_URL = parsedUrl.toString();
      }
    }

    if (looksResolvable) {
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
      console.warn(
        `DATABASE_URL hostname "${hostname}" does not appear resolvable in this environment. ` +
          'Falling back to db.config.js settings for local development.'
      );
    }
  } catch (error) {
    databaseUrlError = error;
    console.warn(
      'DATABASE_URL is defined but could not be parsed. Falling back to db.config.js settings.',
      error
    );
  }
}

if (!sequelize) {
  // Otherwise, fall back to using the individual config values (for local dev)
  if (databaseUrlError) {
    console.warn('DATABASE_URL connection skipped due to parsing error.');
  }
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
