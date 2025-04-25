// backend/controllers/stats.controller.js (Revised - Added 'as' alias)
const db = require("../models"); // Requires models/index.js

// --- Corrected Model Access ---
// Use the keys defined in models/index.js (based on sequelize.define names)
const Question = db.questions;
const UserQuestionStat = db.user_question_stats;
const User = db.users; // Import User model if needed elsewhere
// --- End Corrected Model Access ---

const { Sequelize } = db; // Get Sequelize instance from db object
const Op = Sequelize.Op;  // Get Op from Sequelize instance

// GET /api/stats/summary
exports.getProgressSummary = async (req, res) => {
    const userId = req.userId;
    console.log(`>>> Stats Controller: Fetching progress summary for User ID: ${userId}...`);

    // --- Model Existence Check ---
    if (!Question || !UserQuestionStat) {
        console.error("!!! Stats Controller (Summary): Required models (questions, user_question_stats) not loaded correctly. Check models/index.js.");
        return res.status(500).send({ message: "Server configuration error: Models missing." });
    }
    // --- End Model Check ---

    try {
        console.log(">>> Stats Controller: Counting total questions...");
        const totalQuestionCount = await Question.count();
        console.log(`>>> Stats Controller: Total questions in DB: ${totalQuestionCount}`);

        // Get counts per category
        console.log(">>> Stats Controller: Counting questions per category...");
        const categoryCounts = await Question.findAll({
            attributes: [ 'category', [Sequelize.fn('COUNT', Sequelize.col('id')), 'count'] ],
            where: { category: { [Op.ne]: null, [Op.ne]: '' } },
            group: ['category'],
            raw: true
        });
        const categoryTotalMap = categoryCounts.reduce((map, item) => { map[item.category] = parseInt(item.count, 10); return map; }, {});
        console.log(`>>> Stats Controller: Total questions per category:`, categoryTotalMap);

        // Get counts per sub-category
        console.log(">>> Stats Controller: Counting questions per sub-category...");
        const subCategoryCounts = await Question.findAll({
            attributes: [ 'sub_category', [Sequelize.fn('COUNT', Sequelize.col('id')), 'count'] ],
            where: { sub_category: { [Op.ne]: null, [Op.ne]: '' } },
            group: ['sub_category'],
            raw: true
        });
        const subCategoryTotalMap = subCategoryCounts.reduce((map, item) => { map[item.sub_category] = parseInt(item.count, 10); return map; }, {});
        console.log(`>>> Stats Controller: Total questions per sub-category:`, subCategoryTotalMap);


        // --- Step 2: Get User's Correctly Answered Stats ---
        console.log(`>>> Stats Controller: Fetching correct stats for user ${userId}...`);
        const userCorrectStats = await UserQuestionStat.findAll({
            where: { userId: userId, times_correct: { [Op.gt]: 0 } },
            include: [{
                model: Question,
                as: 'question', // *** Added alias 'question' ***
                attributes: ['id', 'category', 'sub_category'], // Get category/sub_category for grouping
                required: true // Use INNER JOIN to only get stats for existing questions
            }],
            attributes: ['questionId'], // Select only questionId from UserQuestionStat
            raw: true, // Get plain JS objects
            nest: true // Nest the included Question data under the 'question' key
        });
        console.log(`>>> Stats Controller: Found ${userCorrectStats.length} stat records with times_correct > 0 for user.`);

        // --- Step 3: Calculate Mastery ---
        if (totalQuestionCount === 0) {
            console.log(">>> Stats Controller: No questions found in DB. Returning 0 mastery.");
            return res.status(200).json({
                message: "No questions in database.",
                data: { overallMastery: 0, categoryMastery: {}, subCategoryMastery: {}, totalQuestionsAvailable: 0, totalUniqueCorrect: 0 }
            });
        }

        // Access nested ID using the alias 'question'
        const correctQuestionIds = new Set(userCorrectStats.map(stat => stat.question?.id));
        const totalCorrectUnique = correctQuestionIds.size;
        console.log(`>>> Stats Controller: User has answered ${totalCorrectUnique} unique questions correctly.`);

        // Overall Mastery
        const overallMastery = parseFloat(((totalCorrectUnique / totalQuestionCount) * 100).toFixed(1));

        // Category Mastery
        const categoryMastery = {};
        const categoryCorrectCount = {};
        userCorrectStats.forEach(stat => {
            // Access nested question data correctly using the alias 'question'
            const category = stat.question?.category;
            if (category) {
                if (!categoryCorrectCount[category]) categoryCorrectCount[category] = new Set();
                categoryCorrectCount[category].add(stat.question.id); // Access nested ID
            }
        });
        for (const category in categoryTotalMap) {
            const correctCount = categoryCorrectCount[category]?.size || 0;
            const totalInCategory = categoryTotalMap[category];
            categoryMastery[category] = totalInCategory > 0 ? parseFloat(((correctCount / totalInCategory) * 100).toFixed(1)) : 0;
        }

        // Sub-Category Mastery
        const subCategoryMastery = {};
        const subCategoryCorrectCount = {};
        userCorrectStats.forEach(stat => {
            // Access nested question data correctly using the alias 'question'
            const subCategory = stat.question?.sub_category;
            if (subCategory) {
                if (!subCategoryCorrectCount[subCategory]) subCategoryCorrectCount[subCategory] = new Set();
                subCategoryCorrectCount[subCategory].add(stat.question.id); // Access nested ID
            }
        });
        for (const subCategory in subCategoryTotalMap) {
            const correctCount = subCategoryCorrectCount[subCategory]?.size || 0;
            const totalInSubCategory = subCategoryTotalMap[subCategory];
            subCategoryMastery[subCategory] = totalInSubCategory > 0 ? parseFloat(((correctCount / totalInSubCategory) * 100).toFixed(1)) : 0;
        }

        const summaryData = {
            overallMastery,
            categoryMastery,
            subCategoryMastery,
            totalQuestionsAvailable: totalQuestionCount,
            totalUniqueCorrect: totalCorrectUnique
        };
        console.log(">>> Stats Controller: Calculated summary:", summaryData);
        res.status(200).json({ message: "Progress summary fetched successfully", data: summaryData });

    } catch (error) {
        console.error(`>>> Stats Controller: ERROR fetching progress summary for User ID ${userId}:`, error);
        res.status(500).json({ message: "Failed to fetch progress summary.", error: error.message });
    }
};


// GET /api/stats/mastery-by-subcategory
exports.getMasteryBySubCategory = async (req, res) => {
    const userId = req.userId;
    console.log(`>>> Stats Controller: Fetching sub-category mastery for User ID: ${userId}...`);

    // --- Model Existence Check ---
    if (!Question || !UserQuestionStat) {
        console.error("!!! Stats Controller (SubCat): Required models (questions, user_question_stats) not loaded correctly.");
        return res.status(500).send({ message: "Server configuration error: Models missing." });
    }
    // --- End Model Check ---

    try {
        // 1. Get total questions per sub-category (including main category)
        console.log(">>> Stats Controller (SubCat): Counting questions per sub-category with main category...");
        const subCategoryTotals = await Question.findAll({
            attributes: [
                'category',
                'sub_category',
                [Sequelize.fn('COUNT', Sequelize.col('id')), 'totalCount']
            ],
            where: {
                sub_category: { [Op.ne]: null, [Op.ne]: '' },
                category: { [Op.ne]: null, [Op.ne]: '' }
            },
            group: ['category', 'sub_category'], // Group by both
            raw: true
        });
        console.log(`>>> Stats Controller (SubCat): Found ${subCategoryTotals.length} sub-category groupings.`);

        // 2. Get user's correctly answered unique questions per sub-category
        console.log(`>>> Stats Controller (SubCat): Fetching correct stats for user ${userId}...`);
        const userCorrectStats = await UserQuestionStat.findAll({
            where: { userId: userId, times_correct: { [Op.gt]: 0 } },
            include: [{
                model: Question,
                as: 'question', // *** Added alias 'question' ***
                attributes: ['id', 'category', 'sub_category'], // Select needed fields
                required: true, // INNER JOIN
                where: { // Ensure joined question has valid category/sub-category
                    sub_category: { [Op.ne]: null, [Op.ne]: '' },
                    category: { [Op.ne]: null, [Op.ne]: '' }
                }
            }],
            attributes: [], // Don't need attributes from UserQuestionStat itself
            raw: true,
            nest: true // Nest included Question data under 'question' key
        });
        console.log(`>>> Stats Controller (SubCat): Found ${userCorrectStats.length} correct stat records with valid categories.`);

        // 3. Aggregate correct counts (using nested data)
        const correctCountsMap = userCorrectStats.reduce((map, stat) => {
            // Access nested question data correctly using the alias 'question'
            const category = stat.question?.category;
            const subCategory = stat.question?.sub_category;
            if (category && subCategory) {
                const key = `${category}::${subCategory}`;
                if (!map[key]) {
                    map[key] = {
                        mainCategory: category,
                        subCategory: subCategory,
                        correctIds: new Set()
                    };
                }
                map[key].correctIds.add(stat.question.id); // Access nested ID
            }
            return map;
        }, {});
        console.log(`>>> Stats Controller (SubCat): Aggregated correct counts into ${Object.keys(correctCountsMap).length} groups.`);


        // 4. Calculate mastery and format output
        const masteryData = subCategoryTotals.map(totalInfo => {
            const key = `${totalInfo.category}::${totalInfo.sub_category}`;
            const correctCount = correctCountsMap[key]?.correctIds.size || 0;
            const totalCount = parseInt(totalInfo.totalCount, 10);
            const mastery = totalCount > 0 ? parseFloat(((correctCount / totalCount) * 100).toFixed(1)) : 0;

            return {
                mainCategory: totalInfo.category,
                subCategory: totalInfo.sub_category,
                mastery: mastery
            };
        });

        // Optional: Sort the final list
        masteryData.sort((a, b) => {
            if (a.mainCategory !== b.mainCategory) {
                return a.mainCategory.localeCompare(b.mainCategory);
            }
            return a.subCategory.localeCompare(b.subCategory);
        });

        console.log(`>>> Stats Controller (SubCat): Calculated mastery for ${masteryData.length} sub-categories.`);
        res.status(200).send({ data: masteryData });

    } catch (error) {
        console.error(`>>> Stats Controller (SubCat): ERROR fetching sub-category mastery for User ID ${userId}:`, error);
        res.status(500).send({ message: "Failed to fetch sub-category mastery.", error: error.message });
    }
};

// Add other stats controller functions if needed
