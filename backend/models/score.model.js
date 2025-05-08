// backend/models/score.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./user');
// const Question = require('./question'); // Not directly needed for overall score

const Score = sequelize.define('scores', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User, // 'users' is the table name
            key: 'id'
        }
    },
    score: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    // REMOVE these fields if this table is for OVERALL game scores
    // questionId: {
    //     type: DataTypes.INTEGER,
    //     allowNull: false,
    //     references: {
    //         model: Question, // 'questions' is the table name
    //         key: 'id'
    //     }
    // },
    // isCorrect: {
    //     type: DataTypes.BOOLEAN,
    //     allowNull: false
    // }
}, {
    timestamps: true
});

Score.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Score, { foreignKey: 'userId' });

// REMOVE these associations if questionId is removed
// Score.belongsTo(Question, { foreignKey: 'questionId' });
// Question.hasMany(Score, { foreignKey: 'questionId' });

module.exports = Score;