// backend/models/user.model.js (Verified Version)

module.exports = (sequelize, Sequelize) => {
  // Define the model using 'users' as the name
  const User = sequelize.define("users", {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    username: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true
    },
    email: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false
    },
    storeLocation: { // Model field name is camelCase
      type: Sequelize.STRING,
      allowNull: true
      // NO 'field:' mapping here
    },
    inviteCodeUsed: {
        type: Sequelize.STRING,
        allowNull: true
        // NO 'field:' mapping here
    }
    // Timestamps (createdAt, updatedAt) are added automatically
  }, {
    tableName: 'users', // Explicitly set table name
    timestamps: true,
    // underscored: true, // Keep commented out unless ALL columns are snake_case
  });

  User.associate = (models) => {
    // Many-to-Many with Role
    User.belongsToMany(models.role, { // Access Role model using 'role' key
      through: "user_roles",
      foreignKey: "userId",
      otherKey: "roleId"
    });

    // One-to-Many with Score
    User.hasMany(models.scores, { // Access Score model using 'scores' key
      foreignKey: 'userId'
      // Optional alias: as: 'userScores'
    });

    // One-to-Many with UserQuestionStat
    User.hasMany(models.user_question_stats, { // Access UserQuestionStat model using 'user_question_stats' key
      foreignKey: 'userId'
      // Optional alias: as: 'questionStats'
    });
  };

  return User;
};
