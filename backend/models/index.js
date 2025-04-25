// backend/models/index.js (Revised)

const dbConfig = require("../config/db.config.js");
const Sequelize = require("sequelize");

// Initialize Sequelize connection
const sequelize = new Sequelize(
  dbConfig.DB,
  dbConfig.USER,
  dbConfig.PASSWORD,
  {
    host: dbConfig.HOST,
    port: dbConfig.PORT,
    dialect: dbConfig.dialect,
    pool: dbConfig.pool,
    // Log SQL queries only in development
    logging: process.env.NODE_ENV === 'development' ? console.log : false
  }
);

const db = {}; // Object to hold all models and sequelize instances

// Import all model definition functions
// Ensure filenames are correct and files exist
const modelsToLoad = [
  'role.model.js',
  'user.model.js',
  'question.model.js', // Load Question before Score if Score references Question
  'score.model.js',
  'user_question_stat.model.js',
  'inviteCode.model.js'
];

// Load models into the db object
modelsToLoad.forEach(file => {
  try {
    const modelDefinition = require(`./${file}`);
    // Ensure the required file actually exports a function
    if (typeof modelDefinition !== 'function') {
        console.error(`!!! Error loading model ${file}: File does not export a function.`);
        throw new Error(`Model definition file ${file} does not export a function.`);
    }
    const model = modelDefinition(sequelize, Sequelize.DataTypes);
    // Ensure the model name is valid before adding
    if (!model || !model.name) {
        console.error(`!!! Error loading model ${file}: Model definition function did not return a valid model.`);
         throw new Error(`Model definition function in ${file} did not return a valid model.`);
    }
    // Use model.name as the key (e.g., db.role, db.user)
    db[model.name] = model;
    console.log(`>>> Loaded model: ${model.name} from ${file}`); // Log loaded models and filename
  } catch (error) {
      console.error(`!!! Failed to load model from ${file}:`, error);
      // Stop initialization if a model fails to load
      throw error;
  }
});


// Call associate methods AFTER all models are loaded and verified
Object.keys(db).forEach(modelName => {
  // Check if the associate method exists on the model prototype
  if (typeof db[modelName].associate === 'function') {
    console.log(`>>> Calling associate for model: ${modelName}`);
    try {
        // Pass the db object containing all loaded models (e.g., db.role, db.user)
        db[modelName].associate(db);
    } catch (assocError) {
        console.error(`!!! Error calling associate for model ${modelName}:`, assocError);
        // Stop initialization if association fails
        throw assocError;
    }
  } else {
      // This log helps confirm if a model is missing the .associate method
      console.log(`>>> Model ${modelName} does not have an associate method.`);
  }
});


// --- Remove or Comment Out Redundant Relationship Definitions ---
// These should now be handled by the .associate methods called above.
/*
console.log("--- Skipping explicit relationship definitions in index.js ---");
// User <-> Role (Many-to-Many)
// db.role.belongsToMany(db.user, { through: "user_roles", foreignKey: "roleId", otherKey: "userId" });
// db.user.belongsToMany(db.role, { through: "user_roles", foreignKey: "userId", otherKey: "roleId" });

// User <-> Score (One-to-Many)
// db.user.hasMany(db.score, { foreignKey: { name: 'userId', allowNull: false }});
// db.score.belongsTo(db.user, { foreignKey: { name: 'userId', allowNull: false }});

// Question <-> Score (One-to-Many)
// db.question.hasMany(db.score, { as: 'scores', foreignKey: { name: 'questionId', allowNull: false }});
// db.score.belongsTo(db.question, { foreignKey: { name: 'questionId', allowNull: false }});

// User <-> UserQuestionStat (One-to-Many)
// db.user.hasMany(db.userQuestionStat, { foreignKey: { name: 'userId', allowNull: false }});
// db.userQuestionStat.belongsTo(db.user, { foreignKey: { name: 'userId', allowNull: false }});

// Question <-> UserQuestionStat (One-to-Many)
// db.question.hasMany(db.userQuestionStat, { foreignKey: { name: 'questionId', allowNull: false }});
// db.userQuestionStat.belongsTo(db.question, { foreignKey: { name: 'questionId', allowNull: false }});
*/
// --- End Removed Relationships ---


db.ROLES = ["user", "admin", "budtender"]; // Keep predefined roles if used

db.Sequelize = Sequelize; // Export Sequelize library instance
db.sequelize = sequelize; // Export the configured connection instance

module.exports = db; // Export the db object containing models and instances