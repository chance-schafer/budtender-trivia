// d:\Base_Directory_Storage\Coding\dispensary-app\backend\routes\invite.routes.js
const controller = require("../controllers/invite.controller");
const { authJwt } = require("../middleware"); // Assuming you have this middleware

module.exports = function(app) {
  // Removed redundant CORS header setting middleware

  // POST /api/invites - Generate a new code
  // Protected: Requires valid token and user must be admin
  app.post(
    "/api/invites",
    [authJwt.verifyToken, authJwt.isAdmin], // Apply middleware
    controller.createInviteCode
  );

  // GET /api/invites - List existing codes
  // Protected: Requires valid token and user must be admin
  app.get(
    "/api/invites",
    [authJwt.verifyToken, authJwt.isAdmin], // Apply middleware
    controller.listInviteCodes // Link to the controller function
  );

  // DELETE /api/invites/:id - Delete an invite code
  // Protected: Requires valid token and user must be admin
  app.delete(
      "/api/invites/:id",
      [authJwt.verifyToken, authJwt.isAdmin], // Apply middleware
      controller.deleteInviteCode // Link to the controller function
  );
};
