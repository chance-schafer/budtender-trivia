// d:\Base_Directory_Storage\Coding\dispensary-app\backend\routes\trivia.routes.js
const controller = require("../controllers/trivia.controller");
const { authJwt } = require("../middleware"); // Assuming you need authentication/authorization

module.exports = function(app) {
  // Removed redundant CORS header setting middleware

  // Route for players to get game questions (example)
  app.get(
    "/api/trivia/questions", // Or your specific route for game questions
    [authJwt.verifyToken],   // Example: Requires user to be logged in
    controller.getQuestions
  );

  // --- Routes for Admin Question Management ---

  // GET all questions for the admin panel (with search/filter)
  app.get(
    "/api/questions/all",
    [authJwt.verifyToken, authJwt.isAdmin], // Example: Requires admin role
    controller.getAllQuestionsAdmin
  );

  // PUT (update) a specific question
  app.put(
    "/api/questions/:id",
    [authJwt.verifyToken, authJwt.isAdmin], // Example: Requires admin role
    controller.updateQuestion
  );

  // GET distinct categories for filter dropdowns
  app.get(
    "/api/questions/categories",
    [authJwt.verifyToken, authJwt.isAdmin], // Example: Requires admin role
    controller.getDistinctCategories
  );
};
