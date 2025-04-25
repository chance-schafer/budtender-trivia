// backend/controllers/trivia.controller.js (Complete and Revised)
const db = require("../models");
// --- Corrected Model Access ---
const Question = db.questions; // Use 'questions' key
const Score = db.scores;       // Use 'scores' key
// --- End Corrected Model Access ---
const { Sequelize } = db; // Get Sequelize instance from db object
const Op = Sequelize.Op;  // Get Op from Sequelize instance

// --- Helper Function for Model Existence Check ---
const checkModels = (res, ...models) => {
    for (const model of models) {
        if (!model) {
            const modelName = Object.keys(db).find(key => db[key] === model) || 'Unknown';
            console.error(`!!! Controller Error: Model '${modelName}' is not loaded correctly. Check models/index.js.`);
            res.status(500).send({ message: "Server configuration error: A required model is missing." });
            return false; // Indicate failure
        }
    }
    return true; // Indicate success
};
// --- End Helper Function ---


// GET /api/trivia/questions
exports.getQuestions = async (req, res) => {
    const userId = req.userId; // From authJwt.verifyToken
    const roundSize = 20;
    const scoreAlias = 'scores'; // Alias used in Question.associate

    console.log(`>>> Trivia Controller: Requesting GAME questions for User ID: ${userId}. Round size: ${roundSize}. Using score alias: '${scoreAlias}'`);

    if (!checkModels(res, Question, Score)) return; // Check models
    if (!userId) {
        console.error(">>> Trivia Controller: User ID missing from request.");
        return res.status(401).send({ message: "Authentication required." });
    }

    try {
        const questions = await Question.findAll({
            attributes: ['id', 'question', 'options', 'category'], // Select only needed fields for client
            include: [{
                model: Score,       // Use Score variable (from db.scores)
                as: scoreAlias,     // Use the alias defined in Question.associate
                required: false,    // LEFT JOIN
                where: { userId: userId }, // Filter scores for this user
                attributes: ['isCorrect'], // Only need this for ordering
            }],
            order: [
                // Prioritize: NULLS (unanswered) > false (incorrect) > true (correct)
                [Sequelize.col(`${scoreAlias}.isCorrect`), 'NULLS FIRST'],
                [Sequelize.col(`${scoreAlias}.isCorrect`), 'ASC'],
                // Randomize within priority groups
                Sequelize.literal('RANDOM()'), // Adjust for DB dialect if needed (e.g., RAND())
            ],
            limit: roundSize,   // Limit to round size
            subQuery: false     // Help ensure limit applies correctly with JOIN
        });

        console.log(`>>> Trivia Controller: Question.findAll returned ${questions.length} records.`);

        if (!questions || questions.length === 0) {
            console.log(`>>> Trivia Controller: No more questions found for User ID: ${userId}.`);
            return res.status(200).send({ data: [], message: "Congratulations! You've answered all available questions." });
        }

        console.log(`>>> Trivia Controller: Sending ${questions.length} questions for game round for User ID: ${userId}.`);
        // Data is already clean due to specific attributes selection
        res.status(200).send({ data: questions });

    } catch (error) {
        console.error(`>>> Trivia Controller: Error fetching game questions for User ID: ${userId}:`, error);
        if (error.name === 'SequelizeDatabaseError') {
             console.error(">>> Database Error Details:", error.original);
             return res.status(500).send({ message: "Database error occurred while fetching questions. Check ordering syntax or column names." });
        }
         if (error.name === 'SequelizeEagerLoadingError' || error.message.includes('association')) {
             console.error(">>> Eager Loading/Association Error: Check model associations and the alias used ('" + scoreAlias + "').");
             return res.status(500).send({ message: "Server error related to data relationships. Verify model associations." });
         }
        res.status(500).send({ message: "Failed to fetch trivia questions.", error: error.message });
    }
};

// GET /api/questions/all (Admin)
exports.getAllQuestionsAdmin = async (req, res) => {
    console.log(">>> trivia.controller.getAllQuestionsAdmin: Received request query:", req.query);
    const { search, category } = req.query;
    let whereCondition = {};

    if (!checkModels(res, Question)) return; // Check Question model

    // Category Filter
    if (category && category.trim() !== '') {
        whereCondition.category = category;
        console.log(`>>> Applying category filter: ${category}`);
    }
    // Multi-Column Search Filter
    if (search && search.trim() !== '') {
        const trimmedSearch = search.trim();
        const searchTerm = `%${trimmedSearch}%`;
        console.log(`>>> Applying search filter: ${trimmedSearch}`);
        // Define searchable text fields (excluding 'options' due to data type)
        const searchFields = [ 'question', 'category', 'correct_answer', 'explanation' ];
        const orConditions = searchFields.map(field => ({ [field]: { [Op.iLike]: searchTerm } }));

        if (whereCondition.category) {
             // Combine category AND search conditions
             whereCondition = { [Op.and]: [ { category: whereCondition.category }, { [Op.or]: orConditions } ] };
             console.log(">>> Combining Category filter AND Search filter.");
        } else {
            // Only search condition
            whereCondition[Op.or] = orConditions;
            console.log(">>> Applying Search filter only.");
        }
    } else {
         console.log(">>> No valid search term provided.");
    }

    console.log(">>> Executing Question.findAll with where condition:", JSON.stringify(whereCondition, null, 2));
    try {
        const questions = await Question.findAll({ // Use Question variable
             where: whereCondition,
             order: [['id', 'ASC']] // Order by ID for admin view
        });
        console.log(`>>> Trivia Controller: Question.findAll completed. Found ${questions.length} questions.`);
        res.status(200).send({ data: questions }); // Send in { data: [...] } format
    } catch (error) {
        console.error("!!! Error fetching questions for admin:", error);
        res.status(500).send({ message: "Failed to retrieve questions." });
    }
};


// PUT /api/questions/:id (Admin)
exports.updateQuestion = async (req, res) => {
    const questionId = req.params.id;
    console.log(`>>> Trivia Controller: Received update request for ID: ${questionId}. Body:`, req.body);
    const { question: questionText = undefined, options = undefined, correct_answer = undefined, category: cat = undefined, explanation = undefined } = req.body;

    if (!checkModels(res, Question)) return; // Check Question model

    // --- Validation ---
    console.log(`>>> Trivia Controller: Values before validation:`, { questionText, options, correct_answer, cat });
    if (!questionText || !options || !correct_answer || !cat) {
        console.log(">>> Trivia Controller: Validation Failed - Missing required fields.");
        return res.status(400).send({ message: "Missing required question fields (question, options, correct_answer, category)." });
    }
    if (!Array.isArray(options) || options.length < 2) {
         console.log(`>>> Trivia Controller: Validation Failed - Options array invalid (length: ${options?.length}).`);
         return res.status(400).send({ message: "Options must be an array with at least 2 choices." });
    }
    if (!options.includes(correct_answer)) {
        console.log(`>>> Trivia Controller: Validation Failed - Correct answer "${correct_answer}" not found in options: ${JSON.stringify(options)}`);
        return res.status(400).send({ message: "The correct answer must exactly match one of the provided options." });
    }
    // --- End Validation ---

    try {
        const questionRecord = await Question.findByPk(questionId); // Use Question variable
        if (!questionRecord) {
            return res.status(404).send({ message: "Question not found." });
        }

        // Perform update
        await questionRecord.update({
            question: questionText,
            options: options,
            correct_answer: correct_answer,
            category: cat,
            explanation: explanation || null // Allow null explanation
        });

        console.log(`>>> Trivia Controller: Successfully updated question ID: ${questionId}`);
        // Send back updated record
        res.status(200).send({ message: "Question updated successfully.", data: questionRecord });

    } catch (error) {
        console.error(`>>> Trivia Controller: Error updating question ID: ${questionId}:`, error);
        res.status(500).send({ message: "Failed to update question.", error: error.message });
    }
};

// GET /api/questions/categories (Admin)
exports.getDistinctCategories = async (req, res) => {
    console.log(">>> Trivia Controller: Received request for distinct categories.");

    if (!checkModels(res, Question)) return; // Check Question model

    try {
        const categories = await Question.findAll({ // Use Question variable
            attributes: [
                // Use DISTINCT function on the 'category' column
                [Sequelize.fn('DISTINCT', Sequelize.col('category')), 'category']
            ],
            where: {
                // Exclude null or empty categories
                category: { [Op.ne]: null, [Op.ne]: '' }
            },
            order: [['category', 'ASC']], // Order alphabetically
            raw: true // Get plain objects
        });

        // Extract just the names
        const categoryNames = categories.map(item => item.category);

        console.log(`>>> Trivia Controller: Sending ${categoryNames.length} distinct categories.`);
        res.status(200).send({ data: categoryNames }); // Send in { data: [...] } format

    } catch (error) {
        console.error(">>> Trivia Controller: Error fetching distinct categories:", error);
        res.status(500).send({ message: "Failed to fetch categories.", error: error.message });
    }
};
