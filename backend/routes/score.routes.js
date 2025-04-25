// d:\Base_Directory_Storage\Coding\dispensary-app\backend\routes\score.routes.js
// Defines routes related to scores (submit, cultivated, history)
const controller = require("../controllers/score.controller");
const { authJwt } = require("../middleware"); // Auth middleware

module.exports = function(app) {
  // Removed redundant CORS header setting middleware

  // POST /api/scores (Protected)
  app.post( "/api/scores", [authJwt.verifyToken], controller.submitScore );

  // GET /api/scores/cultivated (Public)
  app.get("/api/scores/cultivated", controller.getCultivated);

  // GET /api/scores/my-history (Protected)
  app.get( "/api/scores/my-history", [authJwt.verifyToken], controller.getUserScoreHistory );
};
