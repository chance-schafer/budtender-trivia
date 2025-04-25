// backend/middleware/authJwt.js
const jwt = require("jsonwebtoken");
const config = require("../config/auth.config.js");
const db = require("../models");
const User = db.users; // <-- CORRECTED: Use plural 'users'
const Role = db.role; // <-- CORRECTED: Use singular 'role' (based on previous role.model.js fix)


// Middleware to verify JWT token from request header
const verifyToken = (req, res, next) => {
    // --- ADD LOG ---
    console.log(`>>> authJwt.verifyToken: START for path: ${req.originalUrl}`);
    let token = req.headers["x-access-token"];

    if (!token) {
      console.log(">>> authJwt.verifyToken: FAIL - No token provided.");
      return res.status(403).send({ message: "No token provided!" });
    }

    jwt.verify(token, config.secret, (err, decoded) => {
      if (err) {
        console.log(`>>> authJwt.verifyToken: FAIL - JWT verification error: ${err.name}`);
        if (err.name === 'TokenExpiredError') {
            return res.status(401).send({ message: "Unauthorized! Token has expired." });
        }
        return res.status(401).send({ message: "Unauthorized! Invalid Token." });
      }
      console.log(`>>> authJwt.verifyToken: SUCCESS - Decoded ID: ${decoded.id}. Calling next().`);
      req.userId = decoded.id;
      next(); // Proceed to the next middleware or route handler
    });
  };

// Middleware to check if user has 'admin' role
const isAdmin = async (req, res, next) => {
     // --- ADD LOG ---
     console.log(`>>> authJwt.isAdmin: START for User ID: ${req.userId}, Path: ${req.originalUrl}`);
     try {
        const user = await User.findByPk(req.userId);
        if (!user) {
            console.log(`>>> authJwt.isAdmin: FAIL - User not found for ID: ${req.userId}`);
            return res.status(404).json({ message: "User not found for token." });
        }
        console.log(`>>> authJwt.isAdmin: Found user: ${user.username}. Getting roles...`);
        const roles = await user.getRoles();
        console.log(`>>> authJwt.isAdmin: Roles found: ${roles.map(r => r.name).join(', ')}`);
        for (let i = 0; i < roles.length; i++) {
          if (roles[i].name === "admin") {
            console.log(`>>> authJwt.isAdmin: SUCCESS - Admin role found. Calling next().`);
            next(); // User has the admin role, proceed
            return;
          }
        }
        console.log(`>>> authJwt.isAdmin: FAIL - Admin role not found.`);
        res.status(403).json({ message: "Require Admin Role!" });
     } catch (error) {
        console.error(`>>> authJwt.isAdmin: ERROR - ${error.message}`);
        res.status(500).json({ message: "Error checking admin role."});
     }
};

// Middleware to check if user has 'budtender' role
const isBudtender = async (req, res, next) => {
     // --- ADD LOG ---
     console.log(`>>> authJwt.isBudtender: START for User ID: ${req.userId}, Path: ${req.originalUrl}`);
     try {
        const user = await User.findByPk(req.userId);
        if (!user) {
            console.log(`>>> authJwt.isBudtender: FAIL - User not found for ID: ${req.userId}`);
            return res.status(404).json({ message: "User not found for token." });
        }
        console.log(`>>> authJwt.isBudtender: Found user: ${user.username}. Getting roles...`);
        const roles = await user.getRoles();
        console.log(`>>> authJwt.isBudtender: Roles found: ${roles.map(r => r.name).join(', ')}`);
        for (let i = 0; i < roles.length; i++) {
          if (roles[i].name === "budtender") {
            console.log(`>>> authJwt.isBudtender: SUCCESS - Budtender role found. Calling next().`);
            next(); // User has the budtender role
            return;
          }
        }
        console.log(`>>> authJwt.isBudtender: FAIL - Budtender role not found.`);
        res.status(403).json({ message: "Require Budtender Role!" });
     } catch (error) {
        console.error(`>>> authJwt.isBudtender: ERROR - ${error.message}`);
        res.status(500).json({ message: "Error checking budtender role."});
     }
};

// Middleware to check if user has 'admin' OR 'moderator' role
const isAdminOrModerator = async (req, res, next) => {
  // --- ADD LOG ---
  console.log(`>>> authJwt.isAdminOrModerator: START for User ID: ${req.userId}, Path: ${req.originalUrl}`);
  try {
    const user = await User.findByPk(req.userId);
    if (!user) {
        console.log(`>>> authJwt.isAdminOrModerator: FAIL - User not found for ID: ${req.userId}`);
        return res.status(404).json({ message: "User not found for token." });
    }
    console.log(`>>> authJwt.isAdminOrModerator: Found user: ${user.username}. Getting roles...`);
    const roles = await user.getRoles();
    console.log(`>>> authJwt.isAdminOrModerator: Roles found: ${roles.map(r => r.name).join(', ')}`);
    let hasRequiredRole = false;
    for (let i = 0; i < roles.length; i++) {
      if (roles[i].name === "admin" || roles[i].name === "moderator") {
        hasRequiredRole = true;
        break;
      }
    }

    if (hasRequiredRole) {
        console.log(`>>> authJwt.isAdminOrModerator: SUCCESS - Required role found. Calling next().`);
        next(); // User has one of the required roles
    } else {
        console.log(`>>> authJwt.isAdminOrModerator: FAIL - Required role not found.`);
        res.status(403).send({ message: "Require Admin or Moderator Role!" });
    }

  } catch (error) {
    console.error(`>>> authJwt.isAdminOrModerator: ERROR - ${error.message}`);
    res.status(500).send({ message: "Unable to validate user role!" });
  }
};


// Combine all middleware functions into an object for export
const authJwt = {
  verifyToken: verifyToken,
  isAdmin: isAdmin,
  isBudtender: isBudtender,
  isAdminOrModerator: isAdminOrModerator
};

module.exports = authJwt;
