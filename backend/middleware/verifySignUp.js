// UPDATED: Implemented duplicate check using Sequelize
const db = require("../models"); // Import db object
const User = db.user; // User model
// const ROLES = db.ROLES; // Uncomment if/when using checkRolesExisted

// Middleware to check if username or email already exists in the database
const checkDuplicateUsernameOrEmail = async (req, res, next) => { // Made async
  console.log("SignUp Middleware: Checking for duplicate username/email...");
  try {
    // Check Username
    const userByUsername = await User.findOne({
      where: { username: req.body.username }
    });
    if (userByUsername) {
      console.warn(`Duplicate check failed: Username '${req.body.username}' already exists.`);
      return res.status(400).json({ message: "Failed! Username is already in use!" });
    }

    // Check Email
    const userByEmail = await User.findOne({
      where: { email: req.body.email }
    });
    if (userByEmail) {
       console.warn(`Duplicate check failed: Email '${req.body.email}' already exists.`);
      return res.status(400).json({ message: "Failed! Email is already in use!" });
    }

    // If neither exists, proceed to the next middleware/controller
    console.log("SignUp Middleware: Username and Email are available.");
    next();
  } catch (error) {
    console.error("Error during duplicate check:", error);
    res.status(500).json({ message: "Error checking for duplicates.", error: error.message });
  }
};

// Middleware to check if roles specified in request body are valid roles
const checkRolesExisted = (req, res, next) => {
     console.warn("SignUp Middleware: checkRolesExisted not fully implemented (requires ROLES definition and req.body.roles).");
     // TODO: Implement roles check if roles are sent during signup
     // 1. Check if req.body.roles is an array.
     // 2. If yes, check if each role in req.body.roles exists in db.ROLES array.
     // 3. If any role is invalid, return 400 error.
     // 4. If all valid or no roles sent, call next().
    next(); // Pass through for now
};

const verifySignUp = { checkDuplicateUsernameOrEmail, checkRolesExisted };
module.exports = verifySignUp;