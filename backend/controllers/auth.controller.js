// d:\Base_Directory_Storage\Coding\dispensary-app\backend\controllers\auth.controller.js
const db = require("../models"); // Import the database models object
const config = require("../config/auth.config");

// --- Corrected Model Access ---
// Use the keys consistent with other controllers (likely defined in models/index.js)
const User = db.users;         // Changed from db.user to db.users
const Role = db.role;         // Kept as db.role (seems consistent)
const InviteCode = db.invite_codes; // Changed from db.invite to db.invite_codes
const Op = db.Sequelize.Op;   // Import Op for potential use in invite code query
// --- End Corrected Model Access ---

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// --- Helper Function for Model Existence Check ---
// (Optional but recommended for robustness)
const checkModels = (res, ...models) => {
    for (const model of models) {
        if (!model) {
            // Attempt to find the intended model name based on the variable name
            // This is a basic heuristic and might not always be perfect
            const modelName = Object.keys({ User, Role, InviteCode }).find(key => eval(key) === model) || 'Unknown';
            console.error(`!!! Auth Controller Error: Model '${modelName}' is not loaded correctly. Check models/index.js and key usage (e.g., db.users vs db.user).`);
            res.status(500).send({ message: "Server configuration error: A required authentication model is missing." });
            return false; // Indicate failure
        }
    }
    return true; // Indicate success
};
// --- End Helper Function ---


// Signup Function
exports.signup = async (req, res) => {
    console.log(`>>> Auth Controller: Received signup request for username: ${req.body.username}`);

    // --- Check required models ---
    const requiredModels = config.inviteRequired ? [User, Role, InviteCode] : [User, Role];
    if (!checkModels(res, ...requiredModels)) return;
    // --- End Model Check ---

    const transaction = await db.sequelize.transaction(); // Use transaction for multi-step process
    console.log(">>> Auth Controller (Signup): Started transaction.");

    try {
        let usedInvite = null; // To store the invite if found and used

        // Validate Invite Code if provided and required
        if (config.inviteRequired) {
            if (!req.body.inviteCode) {
                await transaction.rollback();
                return res.status(400).send({ message: "Invite code is required for signup." });
            }
            console.log(`>>> Auth Controller (Signup): Validating invite code: ${req.body.inviteCode}`);
            const invite = await InviteCode.findOne({ // Use InviteCode variable
                where: {
                    code: req.body.inviteCode,
                    // Add checks for isUsed, maxUses, expiresAt if applicable
                    [Op.or]: [ // Allow reusable or single-use non-used codes
                        { isReusable: true, usesCount: { [Op.lt]: db.Sequelize.col('maxUses') } }, // Reusable with uses left
                        { isReusable: true, maxUses: null }, // Reusable unlimited
                        { isReusable: false, usesCount: 0 } // Single-use, not used yet
                    ]
                    // Optional: Check expiry if invites expire
                    // expiresAt: { [Op.gt]: new Date() }
                },
                transaction // Lock the row during check
            });

            if (!invite) {
                await transaction.rollback();
                console.log(`>>> Auth Controller (Signup): Invalid or used invite code: ${req.body.inviteCode}`);
                return res.status(400).send({ message: "Invalid, already used, or expired invite code." });
            }
            usedInvite = invite; // Store the valid invite
            console.log(`>>> Auth Controller (Signup): Invite code ${req.body.inviteCode} is valid.`);
        }

        // Create new user's account
        console.log(`>>> Auth Controller (Signup): Creating user: ${req.body.username}`);
        const user = await User.create({ // Use User variable
            username: req.body.username,
            email: req.body.email,
            password: bcrypt.hashSync(req.body.password, 8),
            storeLocation: req.body.storeLocation || null, // Ensure null if empty
            // Link the invite code used, if applicable (might need a column in User model)
            // inviteCodeUsed: usedInvite ? usedInvite.code : null
        }, { transaction });
        console.log(`>>> Auth Controller (Signup): User created (ID: ${user.id}). Assigning roles...`);

        // Mark invite as used/increment count if signup was successful
        if (usedInvite) {
             console.log(`>>> Auth Controller (Signup): Updating invite code usage (ID: ${usedInvite.id}).`);
             usedInvite.usesCount += 1;
             // Optionally set isUsed if it becomes fully used
             // if (!usedInvite.isReusable || (usedInvite.maxUses && usedInvite.usesCount >= usedInvite.maxUses)) {
             //     usedInvite.isUsed = true; // Assuming you have an isUsed flag for simplicity
             // }
             await usedInvite.save({ transaction }); // Save changes to the invite
        }

        // Assign roles
        let assignedRoles = [];
        if (req.body.roles) {
            console.log(`>>> Auth Controller (Signup): Finding specified roles: ${req.body.roles}`);
            const roles = await Role.findAll({ // Use Role variable
                where: {
                    name: { [Op.in]: req.body.roles }
                },
                transaction
            });
            if (roles.length !== req.body.roles.length) {
                 await transaction.rollback();
                 console.warn(`>>> Auth Controller (Signup): One or more specified roles not found.`);
                 return res.status(400).send({ message: "One or more specified roles are invalid." });
            }
            assignedRoles = roles;
        } else {
            // Default role: 'user'
            console.log(`>>> Auth Controller (Signup): Finding default 'user' role...`);
            const defaultRole = await Role.findOne({ where: { name: 'user' }, transaction });
            if (!defaultRole) {
                await transaction.rollback();
                console.error(">>> Auth Controller (Signup): Default 'user' role not found in database!");
                return res.status(500).send({ message: "Server configuration error: Default role not found. Registration failed." });
            }
            assignedRoles = [defaultRole];
        }

        await user.setRoles(assignedRoles, { transaction });
        console.log(`>>> Auth Controller (Signup): Roles assigned. Committing transaction...`);
        await transaction.commit();
        console.log(`>>> Auth Controller (Signup): Transaction committed. User ${user.username} registered successfully.`);
        res.send({ message: "User was registered successfully!" });

    } catch (error) {
        await transaction.rollback(); // Ensure rollback on any error
        console.error(">>> Auth Controller: Signup Error Caught:", error);
        if (error.name === 'SequelizeUniqueConstraintError') {
             // Extract specific field if possible (depends on constraint naming)
             const field = error.errors && error.errors[0] ? error.errors[0].path : 'Username or Email';
             res.status(400).send({ message: `Failed! ${field} is already in use!` });
        } else {
             res.status(500).send({ message: error.message || "An error occurred during signup." });
        }
    }
};

// Signin Function
exports.signin = async (req, res) => {
    console.log(`>>> Auth Controller: Received signin request for username: ${req.body.username}`);

    // --- Check required models ---
    if (!checkModels(res, User, Role)) return;
    // --- End Model Check ---

    try {
        console.log(`>>> Auth Controller (Signin): Finding user: ${req.body.username}`);
        const user = await User.findOne({ // Use User variable
            where: {
                username: req.body.username
            },
            include: [{ // Include associated roles to send back role names
                model: Role, // Use Role variable
                attributes: ["name"], // Only need the name
                through: {
                    attributes: [] // Don't need attributes from the join table
                }
            }]
        });

        if (!user) {
            console.log(`>>> Auth Controller (Signin): User not found: ${req.body.username}`);
            // Use a generic message to avoid confirming if a username exists
            return res.status(401).send({ message: "Invalid Credentials." });
        }

        console.log(`>>> Auth Controller (Signin): User found (ID: ${user.id}). Verifying password...`);
        const passwordIsValid = bcrypt.compareSync(
            req.body.password,
            user.password
        );

        if (!passwordIsValid) {
            console.log(`>>> Auth Controller (Signin): Invalid password for user: ${req.body.username}`);
            return res.status(401).send({
                accessToken: null,
                message: "Invalid Credentials." // Generic message
            });
        }

        console.log(`>>> Auth Controller (Signin): Password valid. Generating JWT...`);
        // Generate JWT token
        const token = jwt.sign({ id: user.id }, config.secret, {
            expiresIn: config.jwtExpiration || 86400 // Use config value or default (24 hours)
        });

        // Prepare authorities array from user's roles
        let authorities = [];
        if (user.roles && Array.isArray(user.roles)) { // Check if roles were successfully included and is an array
            user.roles.forEach(role => {
                authorities.push("ROLE_" + role.name.toUpperCase());
            });
        } else {
             console.warn(`>>> Auth Controller (Signin): Roles data missing or invalid for user ID ${user.id}. Sending empty roles array.`);
        }

        console.log(`>>> Auth Controller (Signin): Signin successful for user: ${user.username}. Sending response.`);
        // Send successful response
        res.status(200).send({
            id: user.id,
            username: user.username,
            email: user.email,
            roles: authorities,
            accessToken: token,
            storeLocation: user.storeLocation // Include storeLocation if needed by frontend
        });

    } catch (error) {
        console.error(">>> Auth Controller: Signin Error Caught:", error); // Log the detailed error server-side
        // Send a generic error message to the client for security
        res.status(500).send({ message: "An internal server error occurred during signin." });
    }
};
