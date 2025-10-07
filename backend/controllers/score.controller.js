// backend/controllers/score.controller.js (Revised)
const db = require("../models");
// --- Corrected Model Access ---
const Score = db.scores;             // Use 'scores' key
const User = db.users;               // Use 'users' key
const Question = db.questions;         // Use 'questions' key
const UserQuestionStat = db.user_question_stats; // Use 'user_question_stats' key
// --- End Corrected Model Access ---
const { Sequelize } = db; // Get Sequelize instance from db object
const Op = Sequelize.Op;  // Get Op from Sequelize instance

// Handle Score Submission (POST /api/scores)
exports.submitScore = async (req, res, next) => {
  const userId = req.userId;
  const { score, totalQuestions, results } = req.body;
  console.log(`Score Controller: Received score submission from User ID: ${userId}. Score: ${score}/${totalQuestions}`);

  // --- Model Existence Check ---
  if (!Score || !UserQuestionStat) {
      console.error("!!! Score Controller (submitScore): Required models (Score, UserQuestionStat) not loaded correctly.");
      return res.status(500).send({ message: "Server configuration error: Models missing." });
  }
  // --- End Model Check ---

  // Validation
  if (score === undefined || totalQuestions === undefined || !Array.isArray(results)) {
      console.log(">>> Score Controller: Validation Failed - Missing score fields or results array.");
      return res.status(400).json({ message: "Invalid score data provided. Ensure score, totalQuestions, and results array are present." });
  }

  const numericTotalQuestions = Number(totalQuestions);
  if (!Number.isFinite(numericTotalQuestions) || numericTotalQuestions <= 0) {
      console.log(">>> Score Controller: Validation Failed - totalQuestions invalid:", totalQuestions);
      return res.status(400).json({ message: "totalQuestions must be a positive number." });
  }

  const sanitizedResults = results
      .map(result => ({
          questionId: Number(result.questionId),
          isCorrect: Boolean(result.isCorrect)
      }))
      .filter(result => Number.isInteger(result.questionId));

  if (sanitizedResults.length !== numericTotalQuestions) {
      console.log(">>> Score Controller: Validation Failed - Results length mismatch or invalid question IDs.");
      return res.status(400).json({ message: "Results array must contain one entry per question with a valid numeric questionId." });
  }

  const numericScore = Number(score);
  if (!Number.isFinite(numericScore) || numericScore < 0 || numericScore > numericTotalQuestions) {
      console.log(">>> Score Controller: Validation Failed - Invalid score value:", score);
      return res.status(400).json({ message: "Score must be a number between 0 and totalQuestions." });
  }
  // --- End Validation ---

  const computedScore = sanitizedResults.filter(result => result.isCorrect).length;
  if (computedScore !== numericScore) {
      console.log(`>>> Score Controller: Provided score ${numericScore} does not match computed score ${computedScore}. Using computed value.`);
  }

  const transaction = await db.sequelize.transaction();
  console.log(">>> Score Controller: Started transaction.");
  try {
    // 1. Save overall score record (using the correct Score model variable)
    console.log(">>> Score Controller: Saving overall score record...");
    const finalScoreValue = computedScore;
    const percentage = parseFloat(((finalScoreValue / numericTotalQuestions) * 100).toFixed(2));
    const newScoreRecord = await Score.create({ // Use Score variable
        score: finalScoreValue,
        totalQuestions: numericTotalQuestions,
        percentage: percentage,
        userId: userId
    }, { transaction });
    console.log(`>>> Score Controller: Overall score record saved (ID: ${newScoreRecord.id}). Updating question stats...`);

    // 2. Update individual question stats (using the correct UserQuestionStat model variable)
    for (const result of sanitizedResults) {
      const { questionId, isCorrect } = result;
      // Use UserQuestionStat variable
      const [stat, created] = await UserQuestionStat.findOrCreate({
          where: { userId: userId, questionId: questionId },
          defaults: { userId: userId, questionId: questionId, times_seen: 0, times_correct: 0 },
          transaction
      });
      stat.times_seen += 1;
      if (isCorrect) stat.times_correct += 1;
      stat.last_answered_at = new Date(); // Assuming this column exists in user_question_stats
      await stat.save({ transaction });
    }
    console.log(`>>> Score Controller: Finished updating stats for ${results.length} questions.`);

    await transaction.commit();
    console.log(">>> Score Controller: Transaction committed successfully.");
    res.status(201).json({ message: "Score and stats submitted successfully!", data: newScoreRecord }); // Send back the created score record
  } catch (error) {
    await transaction.rollback();
    console.error(`>>> Score Controller: ERROR during score/stats submission for User ID ${userId}. Rolled back.`, error);
     res.status(500).json({ message: "Failed to submit score/stats.", error: error.message });
  }
};

// Get Cultivated Data (GET /api/scores/cultivated)
exports.getCultivated = async (req, res, next) => {
  console.log(">>> Score Controller: Fetching 'Cultivated' board data (100% mastery)...");
  try {
    // --- Model Existence Check ---
    if (!Question || !UserQuestionStat || !Score || !User) {
        console.error("!!! Score Controller (getCultivated): Required models (Question, UserQuestionStat, Score, User) not loaded correctly.");
        return res.status(500).send({ message: "Server configuration error: Models missing." });
    }
    // --- End Model Check ---

    // 1. Get total number of questions (using correct Question model variable)
    const totalQuestionCount = await Question.count(); // Use Question variable
    if (totalQuestionCount === 0) {
        console.log(">>> Score Controller: No questions found in DB for Cultivated check.");
        return res.status(200).json({ message: "Cultivated data unavailable (no questions).", data: [] });
    }
    console.log(`>>> Score Controller: Total questions required for mastery: ${totalQuestionCount}`);

    // 2. Find users and count unique correct answers (using correct UserQuestionStat variable)
    const userCorrectCounts = await UserQuestionStat.findAll({ // Use UserQuestionStat variable
        attributes: [
            'userId',
            [Sequelize.fn('COUNT', Sequelize.fn('DISTINCT', Sequelize.col('questionId'))), 'uniqueCorrectCount']
        ],
        where: { times_correct: { [Op.gt]: 0 } }, // Only count if answered correctly at least once
        group: ['userId'],
        raw: true // Get plain objects
    });
    console.log(`>>> Score Controller: Found ${userCorrectCounts.length} users with >= 1 correct answer.`);

    // 3. Filter for mastered users
    const masteredUserIds = userCorrectCounts
        .filter(userStat => parseInt(userStat.uniqueCorrectCount, 10) >= totalQuestionCount)
        .map(userStat => userStat.userId);
    console.log(`>>> Score Controller: Found ${masteredUserIds.length} users with 100% mastery.`);
    if (masteredUserIds.length === 0) {
        return res.status(200).json({ message: "No users have achieved 100% mastery for the Cultivated list yet.", data: [] });
    }

    // 4. Fetch best scores for mastered users, INCLUDE storeLocation (using correct Score and User variables)
    const relevantScores = await Score.findAll({ // Use Score variable
        where: { userId: { [Op.in]: masteredUserIds } },
        include: [{
            model: User, // Use User variable
            as: 'user',
            attributes: ['username', 'storeLocation'], // Select username and storeLocation
            required: true // INNER JOIN is fine here as we know the user exists
        }],
        order: [
            ['userId', 'ASC'],
            ['percentage', 'DESC'],
            ['score', 'DESC'],
            ['createdAt', 'ASC']
        ],
        attributes: ['userId', 'score', 'totalQuestions', 'percentage', 'createdAt']
    });

    // 5. Process to get single best score per user
    const uniqueBestScores = [];
    const usersAdded = new Set();
    for (const scoreEntry of relevantScores) {
        // Access included User data via the alias defined in Score.associate (default is 'user')
        const userData = scoreEntry.user; // Access the included user data

        if (!usersAdded.has(scoreEntry.userId)) {
             if (userData) { // Check if user data was successfully included
                 uniqueBestScores.push({
                     username: userData.username,
                     storeLocation: userData.storeLocation, // Get storeLocation from included user data
                     score: scoreEntry.score,
                     totalQuestions: scoreEntry.totalQuestions,
                     percentage: scoreEntry.percentage,
                     date: scoreEntry.createdAt
                 });
                 usersAdded.add(scoreEntry.userId);
             } else {
                 console.warn(`Score entry for mastered userId ${scoreEntry.userId} missing associated user data in include.`);
             }
        }
    }
    console.log(`>>> Score Controller: Found ${uniqueBestScores.length} unique best scores for mastered users.`);

    // 6. Re-sort final list
     uniqueBestScores.sort((a, b) => {
         if (b.percentage !== a.percentage) return b.percentage - a.percentage;
         if (b.score !== a.score) return b.score - a.score;
         return new Date(a.date) - new Date(b.date);
     });

    // 7. Add Rank
    const cultivatedList = uniqueBestScores.map((entry, index) => ({
        ...entry,
        rank: index + 1
    }));

    console.log(`>>> Score Controller: Sending 'Cultivated' list with ${cultivatedList.length} entries.`);
    res.status(200).json({ message: "Cultivated list fetched successfully", data: cultivatedList });

  } catch (error) {
    console.error(">>> Score Controller: ERROR caught in getCultivated:", error);
     res.status(500).json({ message: "Failed to fetch Cultivated list.", error: error.message });
  }
};

// Get Score History for Logged-In User (GET /api/scores/my-history)
exports.getUserScoreHistory = async (req, res, next) => {
  const userId = req.userId;
  console.log(`>>> Score Controller: Fetching score history for User ID: ${userId}`);

  // --- Model Existence Check ---
  if (!Score) {
      console.error("!!! Score Controller (getUserScoreHistory): Score model not loaded correctly.");
      return res.status(500).send({ message: "Server configuration error: Score model missing." });
  }
  // --- End Model Check ---

  try {
    console.log(`>>> Score Controller: Querying DB for scores where userId = ${userId}`);
    const userScores = await Score.findAll({ // Use Score variable
        where: { userId: userId },
        order: [ ['createdAt', 'DESC'] ],
        attributes: ['id', 'score', 'totalQuestions', 'percentage', 'createdAt']
    });
    console.log(`>>> Score Controller: Found ${userScores.length} scores for User ID: ${userId}`);
    res.status(200).json({ message: "User score history fetched successfully", data: userScores });
  } catch (error) {
      console.error(`>>> Score Controller: ERROR fetching score history for User ID ${userId}:`, error);
      res.status(500).json({ message: "Failed to fetch score history.", error: error.message });
  }
};
