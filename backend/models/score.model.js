// d:\Base_Directory_Storage\Coding\dispensary-app\backend\models\score.model.js (Revised)
module.exports = (sequelize, Sequelize) => {
  // Define model using 'scores' name, matching db.scores key in index.js
  const Score = sequelize.define("scores", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    // Foreign key for the User who answered
    userId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'users', // Assumes your users table is named 'users'
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    // Foreign key for the Question that was answered
    questionId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'questions', // Assumes your questions table is named 'questions'
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    // Was the answer correct?
    isCorrect: {
      type: Sequelize.BOOLEAN,
      allowNull: false
    },
  }, {
    tableName: 'scores', // Explicitly define table name
    timestamps: true,    // Keep timestamps
  });

  // Define associations within the model file
  Score.associate = (models) => {
    // A Score belongs to one User
    // *** Access User model using 'users' key ***
    Score.belongsTo(models.users, { // Corrected from models.user
      foreignKey: 'userId',
      as: 'user' // Optional alias
    });
    // A Score belongs to one Question
    // *** Access Question model using 'questions' key ***
    Score.belongsTo(models.questions, { // Corrected from models.question
      foreignKey: 'questionId',
      as: 'question' // Optional alias
    });
  };

  return Score;
};
