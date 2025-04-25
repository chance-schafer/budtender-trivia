// d:\Base_Directory_Storage\Coding\dispensary-app\backend\models\question.model.js
module.exports = (sequelize, Sequelize) => {
  // Define model using 'questions' name, matching db.questions key in index.js
  const Question = sequelize.define("questions", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    category: {
      type: Sequelize.STRING(100),
      allowNull: false
    },
    sub_category: {
      type: Sequelize.STRING(100),
      allowNull: true
    },
    question: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    options: {
      type: Sequelize.JSONB, // Use JSONB for PostgreSQL
      allowNull: false
    },
    correct_answer: {
      type: Sequelize.TEXT, // Matches DB 'text' type
      allowNull: false,
      field: 'correct_answer' // Explicitly maps to DB column 'correct_answer'
    },
    explanation: {
      type: Sequelize.TEXT,
      allowNull: true
    },
    difficulty: {
      type: Sequelize.STRING(50),
      defaultValue: 'medium'
    }
    // createdAt and updatedAt are added automatically by Sequelize
  }, {
    tableName: 'questions', // Explicitly set table name
    timestamps: true, // Keep timestamps enabled (default)
    // underscored: false, // Ensure this is false or omitted if DB columns aren't all snake_case
  });

  Question.associate = (models) => {
    // A Question can have many Score records associated with it
    // *** Access Score model using 'scores' key ***
    Question.hasMany(models.scores, { // Corrected from models.score to models.scores
      foreignKey: 'questionId', // The foreign key column in the 'scores' table
      as: 'scores' // This alias MUST match the one used in trivia.controller.js
    });

    // Association with UserQuestionStat (Assuming model name is 'user_question_stats')
    Question.hasMany(models.user_question_stats, { // Use the correct key
        foreignKey: 'questionId'
        // Optional alias: as: 'userStats'
    });
  };

  return Question;
};
