const controller = require("../controllers/auth.controller");
const { verifySignUp } = require("../middleware"); // Import validation middleware

module.exports = function(app) {
  // Removed redundant CORS header setting middleware

  // POST /api/auth/signup
  app.post(
    "/api/auth/signup",
    [ verifySignUp.checkDuplicateUsernameOrEmail ], // Apply middleware
    controller.signup
  );

  // POST /api/auth/signin
  app.post("/api/auth/signin", controller.signin); // Defines POST /api/auth/signin
};