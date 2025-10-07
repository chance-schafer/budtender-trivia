// backend/models/score.model.js

module.exports = (sequelize, Sequelize) => {
  const Score = sequelize.define(
    'scores',
    {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        field: 'userId',
      },
      score: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      totalQuestions: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'totalQuestions',
      },
      percentage: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0,
      },
    },
    {
      tableName: 'scores',
      timestamps: true,
    }
  );

  Score.associate = (models) => {
    Score.belongsTo(models.users, {
      foreignKey: 'userId',
      as: 'user',
    });
  };

  return Score;
};
