// backend/controllers/invite.controller.js (Revised)
const crypto = require('crypto');
const db = require("../models");
// --- Corrected Model Access ---
const InviteCode = db.invite_codes; // Use 'invite_codes' key
// --- End Corrected Model Access ---
const Op = db.Sequelize.Op;

// --- Helper Function for Model Existence Check ---
const checkModels = (res, ...models) => {
    for (const model of models) {
        if (!model) {
            const modelName = Object.keys(db).find(key => db[key] === model) || 'Unknown';
            console.error(`!!! Controller Error: Model '${modelName}' is not loaded correctly. Check models/index.js.`);
            res.status(500).send({ message: "Server configuration error: A required model is missing." });
            return false;
        }
    }
    return true;
};
// --- End Helper Function ---

// --- Helper Function to Generate a Unique Code ---
async function generateUniqueCode(length = 8, maxRetries = 5) {
    // Check if InviteCode model is loaded before proceeding
    if (!InviteCode) {
        console.error("!!! Invite Code Generation Error: InviteCode model is not loaded.");
        throw new Error("Server configuration error: InviteCode model missing.");
    }

    let code;
    let isUnique = false;
    let retries = 0;

    while (!isUnique && retries < maxRetries) {
        code = crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length).toUpperCase();
        try {
            const existingCode = await InviteCode.findOne({ where: { code: code } });
            if (!existingCode) {
                isUnique = true;
            } else {
                console.warn(`Invite Code Generation: Collision detected for code ${code}. Retrying...`);
                retries++;
            }
        } catch (dbError) {
            console.error("Invite Code Generation: Database error checking uniqueness:", dbError);
            throw new Error("Failed to verify code uniqueness due to database error.");
        }
    }

    if (!isUnique) {
        console.error(`Invite Code Generation: Failed to generate a unique code after ${maxRetries} retries.`);
        throw new Error(`Failed to generate a unique invite code after ${maxRetries} attempts.`);
    }
    return code;
}

// POST /api/invites (Admin only - Create an invite code) - Renamed from generateInviteCode to createInviteCode
exports.createInviteCode = async (req, res) => {
    const { storeLocation, isReusable = false, maxUses = null } = req.body;
    console.log(">>> Invite Controller: Received request to create invite code. Data:", req.body);

    if (!checkModels(res, InviteCode)) return; // Check model

    // Validate maxUses if provided
    let maxUsesValue = null;
    if (isReusable && maxUses !== null && maxUses !== undefined) {
        const parsedMaxUses = parseInt(maxUses, 10);
        if (isNaN(parsedMaxUses) || parsedMaxUses <= 0) {
            return res.status(400).send({ message: "If provided, maxUses must be a positive integer." });
        }
        maxUsesValue = parsedMaxUses;
    }

    try {
        const code = await generateUniqueCode(8); // Use helper function
        console.log(`>>> Invite Controller: Generated unique code: ${code}`);

        const inviteData = {
            code: code,
            storeLocation: storeLocation || null, // Allow null if empty string provided
            isReusable: !!isReusable,
            maxUses: maxUsesValue,
            usesCount: 0
        };

        console.log(">>> Invite Controller: Attempting to create InviteCode with data:", inviteData);
        const newInviteCode = await InviteCode.create(inviteData); // Use InviteCode variable

        console.log(`>>> Invite Controller: Successfully created invite code: ${newInviteCode.code}`);
        res.status(201).send({ message: "Invite code created successfully!", inviteCode: newInviteCode });

    } catch (error) {
        console.error("!!! Invite Controller: Error creating invite code:", error);
        // Handle specific errors (like unique code generation failure) or send generic message
        res.status(500).send({ message: error.message || "Failed to create invite code." });
    }
};

// GET /api/invites (Admin only - List all invite codes)
exports.listInviteCodes = async (req, res) => {
    console.log(">>> Invite Controller: Received request to list invite codes.");

    if (!checkModels(res, InviteCode)) return; // Check model

    try {
        const codes = await InviteCode.findAll({ // Use InviteCode variable
            order: [['createdAt', 'DESC']]
        });
        console.log(`>>> Invite Controller: Successfully fetched ${codes.length} invite codes.`);
        res.status(200).send(codes); // Send array directly
    } catch (error) {
        console.error("!!! Invite Controller: Error listing invite codes:", error);
        res.status(500).send({ message: "Failed to retrieve invite codes.", error: error.message });
    }
};

// DELETE /api/invites/:id (Admin only - Delete an invite code)
exports.deleteInviteCode = async (req, res) => {
    const codeId = req.params.id;
    console.log(`>>> Invite Controller: Received request to delete invite code ID: ${codeId}`);

    if (!checkModels(res, InviteCode)) return; // Check model

    try {
        const code = await InviteCode.findByPk(codeId); // Use InviteCode variable
        if (!code) {
            console.log(`>>> Invite Controller: Invite code not found for deletion (ID: ${codeId})`);
            return res.status(404).send({ message: `Invite code with ID ${codeId} not found.` });
        }

        await code.destroy();

        console.log(`>>> Invite Controller: Successfully deleted invite code: ${code.code} (ID: ${codeId})`);
        res.status(200).send({ message: `Invite code ${code.code} deleted successfully.` });

    } catch (error) {
        console.error(`!!! Invite Controller: Error deleting invite code (ID: ${codeId}):`, error);
        res.status(500).send({ message: "Failed to delete invite code.", error: error.message });
    }
};
