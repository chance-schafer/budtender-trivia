// backend/controllers/user.controller.js (Revised)
const db = require("../models");
// --- Corrected Model Access ---
const User = db.users; // Use 'users' key
const Role = db.role;   // Use 'role' key
const Score = db.scores; // Use 'scores' key
const UserQuestionStat = db.user_question_stats; // Use 'user_question_stats' key
// Note: InviteCode model is not directly used in the provided functions,
// but if needed elsewhere in this file, use: const InviteCode = db.invite_codes;
// --- End Corrected Model Access ---

const bcrypt = require("bcryptjs"); // Needed for password update if added later
const { Sequelize } = db; // Import Sequelize
const Op = db.Sequelize.Op;

// --- Helper Function for Model Existence Check ---
const checkModels = (res, ...models) => {
    for (const model of models) {
        if (!model) {
            const modelName = Object.keys(db).find(key => db[key] === model) || 'Unknown'; // Attempt to find name
            console.error(`!!! Controller Error: Model '${modelName}' is not loaded correctly. Check models/index.js.`);
            res.status(500).send({ message: "Server configuration error: A required model is missing." });
            return false; // Indicate failure
        }
    }
    return true; // Indicate success
};
// --- End Helper Function ---


// --- Test Access Controllers (Placeholder Implementations) ---
exports.allAccess = (req, res) => {
    res.status(200).send("Public Content.");
};
exports.userBoard = (req, res) => {
    res.status(200).send("User Content.");
};
exports.adminBoard = (req, res) => {
    res.status(200).send("Admin Content.");
};
exports.moderatorBoard = (req, res) => {
    res.status(200).send("Moderator Content.");
};
// --- End Test Access Controllers ---


// GET /api/users/me (Get current user details) - Renamed from updateProfile to getCurrentUser
exports.getCurrentUser = async (req, res) => {
    const userId = req.userId; // Get user ID from verifyToken middleware
    console.log(`>>> User Controller: Fetching details for current user ID: ${userId}`);

    if (!checkModels(res, User, Role)) return; // Check models

    try {
        const user = await User.findByPk(userId, {
            attributes: ['id', 'username', 'email', 'storeLocation', 'createdAt'], // Exclude password
            include: [{
                model: Role,
                attributes: ['name'], // Only get role names
                through: { attributes: [] } // Don't include junction table attributes
            }]
        });

        if (!user) {
            console.log(`>>> User Controller: User not found for ID: ${userId}`);
            return res.status(404).send({ message: "User not found." });
        }

        // Format roles
        const authorities = user.roles.map(role => "ROLE_" + role.name.toUpperCase());

        console.log(`>>> User Controller: Successfully fetched details for user: ${user.username}`);
        res.status(200).send({
            id: user.id,
            username: user.username,
            email: user.email,
            storeLocation: user.storeLocation,
            roles: authorities,
            createdAt: user.createdAt
        });

    } catch (error) {
        console.error(`>>> User Controller: Error fetching current user (ID: ${userId}):`, error);
        res.status(500).send({ message: "Failed to fetch user details.", error: error.message });
    }
};

// PUT /api/users/me (Update current user details) - Renamed from updateProfile to updateCurrentUser
exports.updateCurrentUser = async (req, res) => {
    const userId = req.userId;
    const { username, email, storeLocation /*, password */ } = req.body; // Get fields to update
    console.log(`>>> User Controller: Updating details for current user ID: ${userId}. Data:`, req.body);

    if (!checkModels(res, User)) return; // Check User model

    // Prepare fields to update
    const updateData = {};
    try {
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).send({ message: "User not found." });
        }

        // Validate and prepare updates
        if (username !== undefined && username !== user.username) {
            const existingUsername = await User.findOne({ where: { username: username, id: { [Op.ne]: userId } } });
            if (existingUsername) {
                return res.status(400).send({ message: "Failed! Username is already in use!" });
            }
            updateData.username = username;
            console.log(`>>> User Controller: Preparing username update for user ID: ${userId}`);
        }
        if (email !== undefined && email !== user.email) {
            const existingEmail = await User.findOne({ where: { email: email, id: { [Op.ne]: userId } } });
            if (existingEmail) {
                return res.status(400).send({ message: "Failed! Email is already in use!" });
            }
            updateData.email = email;
            console.log(`>>> User Controller: Preparing email update for user ID: ${userId}`);
        }
        if (storeLocation !== undefined && storeLocation !== user.storeLocation) {
            updateData.storeLocation = storeLocation === '' ? null : storeLocation; // Allow setting to null
            console.log(`>>> User Controller: Preparing storeLocation update for user ID: ${userId}`);
        }
        // Add password update logic here if needed

        if (Object.keys(updateData).length === 0) {
            console.log(`>>> User Controller: No changes detected for user ID: ${userId}`);
            // Still fetch and return current user data even if no changes
        } else {
            await user.update(updateData);
            console.log(`>>> User Controller: Profile updated successfully for user ID: ${userId}`);
        }

        // Fetch updated user data to send back (excluding password)
        const updatedUser = await User.findByPk(userId, {
             attributes: ['id', 'username', 'email', 'storeLocation', 'createdAt', 'updatedAt'], // Include updatedAt
             include: [{
                model: Role,
                attributes: ['name'],
                through: { attributes: [] }
            }]
        });

        // Format roles
        const plainUser = updatedUser.get({ plain: true });
        plainUser.roles = plainUser.roles.map(role => `ROLE_${role.name.toUpperCase()}`);

        res.status(200).send({
            message: Object.keys(updateData).length > 0 ? "Profile updated successfully!" : "No changes applied.",
            user: plainUser // Send back potentially updated user data
        });

    } catch (error) {
        console.error(`>>> User Controller: Error updating profile for user ID: ${userId}:`, error);
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).send({ message: "Failed! Username or Email is already in use!" });
        }
        res.status(500).send({ message: "Failed to update profile.", error: error.message });
    }
};


// GET /api/users (Admin/Mod only - List all users)
exports.getAllUsers = async (req, res) => {
    console.log(">>> User Controller: Received request to get all users.");

    if (!checkModels(res, User, Role)) return; // Check models

    try {
        const users = await User.findAll({
            attributes: ['id', 'username', 'email', 'storeLocation', 'createdAt'], // Exclude password
            include: [{
                model: Role,
                attributes: ['name'], // Include role names
                through: { attributes: [] } // Don't include junction table attributes
            }],
            order: [['username', 'ASC']] // Order alphabetically by username
        });

        // Format roles for frontend consistency
        const formattedUsers = users.map(user => {
            const plainUser = user.get({ plain: true }); // Get plain object
            plainUser.roles = plainUser.roles.map(role => `ROLE_${role.name.toUpperCase()}`);
            return plainUser;
        });

        console.log(`>>> User Controller: Sending ${formattedUsers.length} users.`);
        // Send response in { data: [...] } format expected by AdminToolsPage
        res.status(200).send({ data: formattedUsers });

    } catch (error) {
        console.error(">>> User Controller: Error fetching all users:", error);
        res.status(500).send({ message: "Failed to fetch users.", error: error.message });
    }
};

// DELETE /api/users/:id (Admin only - Delete a user)
exports.deleteUser = async (req, res) => {
    const userIdToDelete = req.params.id;
    const requestingUserId = req.userId; // ID of the admin making the request

    console.log(`>>> User Controller: Received request to delete user ID: ${userIdToDelete} by admin ID: ${requestingUserId}`);

    // Check required models
    if (!checkModels(res, User, Score, UserQuestionStat)) return;

    // Prevent admin from deleting themselves
    if (String(userIdToDelete) === String(requestingUserId)) {
        return res.status(400).send({ message: "Cannot delete your own account." });
    }

    const transaction = await db.sequelize.transaction();
    console.log(`>>> User Controller: Starting transaction for deleting user ID: ${userIdToDelete}`);

    try {
        const user = await User.findByPk(userIdToDelete, { transaction });
        if (!user) {
            await transaction.rollback();
            return res.status(404).send({ message: "User not found." });
        }

        // 1. Delete associated scores
        console.log(`>>> User Controller: Deleting scores for user ID: ${userIdToDelete}`);
        await Score.destroy({ where: { userId: userIdToDelete }, transaction });

        // 2. Delete associated question stats
        console.log(`>>> User Controller: Deleting question stats for user ID: ${userIdToDelete}`);
        await UserQuestionStat.destroy({ where: { userId: userIdToDelete }, transaction });

        // 3. Delete associations from user_roles table
        console.log(`>>> User Controller: Deleting role associations for user ID: ${userIdToDelete}`);
        await user.setRoles([], { transaction }); // Sequelize method to remove all associations

        // 4. Delete the user itself
        console.log(`>>> User Controller: Deleting user record for ID: ${userIdToDelete}`);
        await User.destroy({ where: { id: userIdToDelete }, transaction });

        await transaction.commit();
        console.log(`>>> User Controller: Successfully deleted user ID: ${userIdToDelete} and associated data. Transaction committed.`);
        res.status(200).send({ message: `User ${user.username} deleted successfully.` });

    } catch (error) {
        await transaction.rollback();
        console.error(`>>> User Controller: Error deleting user ID: ${userIdToDelete}. Rolled back transaction.`, error);
        res.status(500).send({ message: "Failed to delete user.", error: error.message });
    }
};

// GET /api/users/locations (Get distinct store locations) - Renamed from getDistinctStoreLocations
exports.getDistinctUserLocations = async (req, res) => {
    console.log(">>> User Controller: Received request for distinct store locations.");

    if (!checkModels(res, User)) return; // Check User model

    try {
        const locations = await User.findAll({
            attributes: [
                [Sequelize.fn('DISTINCT', Sequelize.col('storeLocation')), 'storeLocation']
            ],
            where: {
                storeLocation: {
                    [Op.ne]: null,
                    [Op.ne]: ''
                }
            },
            order: [['storeLocation', 'ASC']],
            raw: true
        });

        const locationNames = locations.map(item => item.storeLocation);

        console.log(`>>> User Controller: Sending ${locationNames.length} distinct store locations.`);
        res.status(200).send({ data: locationNames }); // Send in { data: [...] } format

    } catch (error) {
        console.error(">>> User Controller: Error fetching distinct store locations:", error);
        res.status(500).send({ message: "Failed to fetch store locations.", error: error.message });
    }
};
