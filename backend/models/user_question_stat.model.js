// backend/models/user_question_stat.model.js (Complete with Associations)

module.exports = (sequelize, Sequelize) => {
  // Define model using 'user_question_stats' name, matching db.user_question_stats key in index.js
  const UserQuestionStat = sequelize.define("user_question_stats", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    // Foreign key for the User
    userId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'users', // Links to 'users' table
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    // Foreign key for the Question
    questionId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'questions', // Links to 'questions' table
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    times_seen: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    times_correct: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    last_answered_at: {
      type: Sequelize.DATE,
      allowNull: true // Or false with defaultValue: Sequelize.NOW if always set
    }
    // Timestamps (createdAt, updatedAt) are added automatically
  }, {
    tableName: 'user_question_stats', // Explicitly define table name
    timestamps: true,
    // Add a unique constraint to ensure only one stat record per user/question
    indexes: [
      {
        unique: true,
        fields: ['userId', 'questionId']
      }
    ]
  });

  // *** Define Associations ***
  UserQuestionStat.associate = (models) => {
    // A UserQuestionStat belongs to one User
    UserQuestionStat.belongsTo(models.users, { // Use 'users' key
      foreignKey: 'userId',
      as: 'user' // Optional alias
    });
    // A UserQuestionStat belongs to one Question
    UserQuestionStat.belongsTo(models.questions, { // Use 'questions' key
      foreignKey: 'questionId',
      as: 'question' // *** Define the alias 'question' ***
    });
  };
  // *** End Associations ***

  return UserQuestionStat;
};
