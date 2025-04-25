// d:\Base_Directory_Storage\Coding\dispensary-app\backend\routes\stats.routes.js
// Defines routes related to fetching user statistics/progress
const controller = require("../controllers/stats.controller"); // Ensure this path is correct
const { authJwt } = require("../middleware");

module.exports = function(app) {
  // Removed redundant CORS header setting middleware

  // GET /api/stats/summary (Protected)
  console.log("Defining route: GET /api/stats/summary");
  app.get(
    "/api/stats/summary",
    [authJwt.verifyToken], // Requires user to be logged in
    controller.getProgressSummary // Assumes this function exists in stats.controller.js
  );

  // GET /api/stats/mastery-by-subcategory (Protected)
  console.log("Defining route: GET /api/stats/mastery-by-subcategory");
  app.get(
    "/api/stats/mastery-by-subcategory",
    [authJwt.verifyToken], // Requires user to be logged in
    controller.getMasteryBySubCategory // Assumes this function exists in stats.controller.js
  );
};
